from django.db.models import Sum, Count, Q
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .models import Category, Collection, ContactMessage, ContactMessageReply, Notification, Order, OrderStatusHistory, Product, ProductImage, ProductVariant, StoreSettings, User
from .serializers import CategorySerializer, CollectionSerializer, ContactMessageSerializer, ContactMessageReplySerializer, NotificationSerializer, OrderSerializer, ProductImageSerializer, ProductSerializer, UserSerializer, VariantSerializer
from .email_service import notify_order_status, send_reply_notification


class AdminProductSerializer(ProductSerializer):
    category_id = serializers.PrimaryKeyRelatedField(source="category", queryset=Category.objects.all(), required=False, allow_null=True, write_only=True)
    collection_id = serializers.PrimaryKeyRelatedField(source="collection", queryset=Collection.objects.all(), required=False, allow_null=True, write_only=True)
    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ("category_id", "collection_id")


class AdminProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Product.objects.prefetch_related("variants").select_related("category", "collection")
    serializer_class = AdminProductSerializer
    def perform_create(self, serializer): serializer.save()
    @action(detail=True, methods=["post"], url_path="stock")
    def stock(self, request, pk=None):
        product = self.get_object()
        if "stock" in request.data: product.stock = max(0, int(request.data["stock"]))
        product.save(update_fields=["stock"])
        return Response(AdminProductSerializer(product).data)
    @action(detail=True, methods=["post"], url_path="variants")
    def variants(self, request, pk=None):
        product = self.get_object()
        variant, _ = ProductVariant.objects.update_or_create(product=product, name=request.data["name"], defaults={"hex": request.data.get("hex", "#C6A369"), "images": request.data.get("images", []), "stock": max(0, int(request.data.get("stock", 0))), "sku": request.data.get("sku", "")})
        return Response(VariantSerializer(variant).data, status=status.HTTP_201_CREATED)
    @action(detail=True, methods=["post"], url_path="images", parser_classes=[MultiPartParser, FormParser])
    def images(self, request, pk=None):
        product = self.get_object()
        uploaded = request.FILES.get("image")
        variant_id = request.data.get("variant_id")
        if not uploaded: return Response({"detail": "image is required."}, status=400)
        if uploaded.content_type not in {"image/jpeg", "image/png", "image/webp"} or uploaded.size > 5 * 1024 * 1024:
            return Response({"detail": "Unsupported image type or size."}, status=400)
        
        # If variant_id is provided, try to find the variant
        variant = None
        if variant_id:
            variant = product.variants.filter(id=variant_id).first()
            if not variant:
                # Try by name if it's not a UUID
                variant = product.variants.filter(name=variant_id).first()

        image = ProductImage.objects.create(
            product=product, 
            variant=variant,
            image=uploaded, 
            is_primary=not product.media_images.exists(), 
            position=product.media_images.count()
        )
        return Response(ProductImageSerializer(image, context={"request": request}).data, status=201)
    @action(detail=True, methods=["delete"], url_path=r"images/(?P<image_id>[^/.]+)")
    def delete_image(self, request, pk=None, image_id=None):
        image = ProductImage.objects.filter(product_id=pk, pk=image_id).first()
        if not image: return Response({"detail": "Image not found."}, status=404)
        image.image.delete(save=False)
        image.delete()
        return Response(status=204)


class AdminCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def perform_create(self, serializer):
        image = self.request.FILES.get("image")
        if image: serializer.save(image=image)
        else: serializer.save()

    def perform_update(self, serializer):
        image = self.request.FILES.get("image")
        if image: serializer.save(image=image)
        else: serializer.save()


class AdminCollectionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Collection.objects.prefetch_related("products")
    serializer_class = CollectionSerializer

    def perform_create(self, serializer):
        image = self.request.FILES.get("image")
        if image: serializer.save(image=image)
        else: serializer.save()

    def perform_update(self, serializer):
        image = self.request.FILES.get("image")
        if image: serializer.save(image=image)
        else: serializer.save()


class AdminOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Order.objects.all().prefetch_related("items").order_by("-created_at")
    serializer_class = OrderSerializer
    http_method_names = ["get", "patch", "head", "options"]
    def perform_update(self, serializer):
        old_status = self.get_object().status
        instance = serializer.save()
        if old_status != instance.status:
            OrderStatusHistory.objects.create(order=instance, status=instance.status)
            
            # Notify Customer
            status_msgs = {
                "confirmed": "confirmed and is being prepared.",
                "processing": "being processed.",
                "shipped": "shipped! You can track it soon.",
                "delivered": "delivered. Enjoy your Solenne pieces!",
                "cancelled": "cancelled. If you have questions, contact our atelier.",
                "returned": "marked as returned."
            }
            msg_suffix = status_msgs.get(instance.status, f"status updated to {instance.status}.")
            
            Notification.objects.create(
                user=instance.user,
                title=f"Order Update: {instance.status.title()}",
                message=f"Your order {instance.order_number} has been {msg_suffix}",
                url=f"/orders/{instance.id}"
            )

            notify_order_status(instance)


class AdminUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    joined_at = serializers.DateTimeField(source="date_joined", format="%Y-%m-%d", read_only=True)
    order_count = serializers.IntegerField(read_only=True)
    total_spent = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = User
        fields = ("id", "email", "name", "first_name", "last_name", "phone", "joined_at", "order_count", "total_spent")
        
    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email

class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer
    
    def get_queryset(self):
        return User.objects.annotate(
            order_count=Count("orders", distinct=True),
            total_spent=Sum("orders__total", filter=Q(orders__payment_status="paid"))
        ).all().order_by("-date_joined")


class AdminContactMessageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = ContactMessageSerializer
    queryset = ContactMessage.objects.prefetch_related("replies__sender").all().order_by("-created_at")

    def get_queryset(self):
        qs = super().get_queryset()
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
        return qs

    @action(detail=True, methods=["post"])
    def reply(self, request, pk=None):
        message = self.get_object()
        text = request.data.get("text")
        if not text:
            return Response({"detail": "text is required."}, status=400)
            
        ContactMessageReply.objects.create(
            message=message,
            sender=request.user,
            text=text,
            is_admin=True
        )
        
        # Mark as replied and read
        message.status = "replied"
        message.is_read = True
        message.is_read_by_user = False
        message.save(update_fields=["status", "is_read", "is_read_by_user", "updated_at"])
        
        # Notify via Email
        send_reply_notification(message, text)
        
        # Notify user if exists
        if message.user:
            Notification.objects.create(
                user=message.user,
                title="Reply to your inquiry",
                message=f"The Solenne atelier has replied to: {message.subject}",
                url="/account?tab=messages"
            )
            
        return Response({"detail": "Reply sent."}, status=201)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance.is_read:
            instance.is_read = True
            instance.save(update_fields=["is_read"])
        return super().retrieve(request, *args, **kwargs)


class AdminNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = NotificationSerializer
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")
    
    @action(detail=True, methods=["post"])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(self.get_serializer(notification).data)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def dashboard_view(request):
    orders = Order.objects.all()
    return Response({"totalRevenue": orders.aggregate(total=Sum("total"))["total"] or 0, "totalOrders": orders.count(), "totalCustomers": User.objects.filter(is_staff=False).count(), "totalProducts": Product.objects.count(), "pendingOrders": orders.filter(status="pending").count(), "lowStockProducts": Product.objects.filter(stock__lte=5).count()})


class AdminSettingsViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]
    def list(self, request):
        settings = StoreSettings.objects.filter(key="store").first()
        return Response(settings.data if settings else {})
    def update(self, request, pk=None):
        settings, _ = StoreSettings.objects.update_or_create(key="store", defaults={"data": request.data})
        return Response(settings.data)
