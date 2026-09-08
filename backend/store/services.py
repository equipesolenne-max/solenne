from django.db import transaction
from rest_framework.exceptions import ValidationError
from .models import IdempotencyKey, Notification, Order, OrderItem, OrderStatusHistory, Product, ProductVariant, User
from .email_service import send_order_confirmation

SHIPPING_THRESHOLD = 5000
SHIPPING_COST = 1000


def create_order(*, user: User, items: list[dict], shipping: dict, payment_method: str, idempotency_key: str) -> Order:
    if not items or not idempotency_key:
        raise ValidationError("Items and idempotency_key are required.")
    with transaction.atomic():
        existing = IdempotencyKey.objects.select_related("order").filter(key=idempotency_key, user=user).first()
        if existing:
            return existing.order
        product_ids = []
        for item in items:
            raw_id = item.get("product_id") or item.get("productId")
            try:
                product_ids.append(int(raw_id))
            except (ValueError, TypeError, AttributeError):
                raise ValidationError(f"Invalid product ID: {raw_id}")
        
        products = {product.id: product for product in Product.objects.select_for_update().prefetch_related("variants").filter(id__in=product_ids, active=True)}
        
        if len(products) != len(set(product_ids)):
            missing = set(product_ids) - set(products.keys())
            raise ValidationError(f"Product(s) {list(missing)} no longer exist. Please refresh your bag.")
        
        subtotal = 0
        resolved = []
        for item in items:
            quantity = int(item.get("quantity", 0))
            raw_id = item.get("product_id") or item.get("productId")
            pid = int(raw_id)

            product = products.get(pid)
            if not product or quantity < 1:
                raise ValidationError("Invalid order item.")
            
            variant = None
            variant_id = item.get("variantId")
            color = item.get("color", "")
            size = item.get("size", "")
            
            if variant_id:
                variant = next((candidate for candidate in product.variants.all() if str(candidate.id) == str(variant_id)), None)
            elif color:
                variant = next((candidate for candidate in product.variants.all() if candidate.name == color and candidate.size == size), None)
            
            if variant:
                if variant.stock < quantity:
                    raise ValidationError(f"Insufficient stock for {product.name} ({variant.name}{' ' + variant.size if variant.size else ''}).")
                variant.stock -= quantity
                variant.save(update_fields=["stock"])
                price = variant.price if variant.price is not None else product.price
            else:
                if product.stock < quantity:
                    raise ValidationError(f"Insufficient stock for {product.name}.")
                product.stock -= quantity
                product.save(update_fields=["stock"])
                price = product.price
                
            line_total = price * quantity
            subtotal += line_total
            resolved.append((product, variant, color, size, quantity, price, line_total))
        
        shipping_cost = 0 if subtotal >= SHIPPING_THRESHOLD else SHIPPING_COST
        order = Order.objects.create(
            user=user, 
            order_number=f"SOL-{str(Order.objects.count() + 1).zfill(6)}", 
            customer=shipping.get("name", "").strip(), 
            email=user.email, 
            phone=shipping.get("phone", "").strip(), 
            subtotal=subtotal, 
            shipping_cost=shipping_cost, 
            total=subtotal + shipping_cost, 
            payment_method=payment_method or "Cash on delivery", 
            shipping={"wilaya": shipping.get("wilaya", ""), "commune": shipping.get("commune", ""), "address": shipping.get("address", "")}
        )
        
        for product, variant, color, size, quantity, price, line_total in resolved:
            # Try to get a primary image from ProductMedia
            image_url = ""
            pm = product.product_media.filter(variant=variant, is_primary=True).first()
            if not pm:
                pm = product.product_media.filter(variant=variant).first()
            if not pm and variant: # Fallback to product images if variant has none
                pm = product.product_media.filter(variant=None, is_primary=True).first()
                if not pm:
                    pm = product.product_media.filter(variant=None).first()
            
            if pm:
                from .serializers import get_media_url
                image_url = get_media_url(pm.media, None)
            
            OrderItem.objects.create(
                order=order, 
                product=product, 
                name=product.name, 
                color=f"{color}{' ' + size if size else ''}".strip(), 
                image=image_url, 
                quantity=quantity, 
                price=price, 
                subtotal=line_total
            )
        OrderStatusHistory.objects.create(order=order, status=order.status)
        IdempotencyKey.objects.create(key=idempotency_key, user=user, order=order)
        
        # Notify Customer
        Notification.objects.create(
            user=user,
            title="Order Placed",
            message=f"Your order {order.order_number} has been successfully placed.",
            url=f"/orders/{order.id}"
        )
        
        # Notify Admin
        admin_users = User.objects.filter(is_staff=True)
        for admin in admin_users:
            Notification.objects.create(
                user=admin,
                title="New Order Received",
                message=f"Order {order.order_number} was placed by {order.customer}.",
                url=f"/admin/orders/{order.id}"
            )
            
            # Check for low stock items in this order
            for product, variant, color, quantity, _ in resolved:
                current_stock = variant.stock if variant else product.stock
                if current_stock <= 5: # Assuming 5 as threshold or fetch from settings
                    item_name = f"{product.name} ({color})" if color else product.name
                    Notification.objects.create(
                        user=admin,
                        title="Low Stock Alert",
                        message=f"{item_name} has only {current_stock} units left.",
                        url=f"/admin/products/{product.id}/edit"
                    )

        send_order_confirmation(order)
        return order
