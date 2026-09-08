from django.db.models import Q, Prefetch
from django.utils import timezone
from rest_framework import generics, serializers, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.forms import PasswordResetForm
from django.http import HttpResponse, Http404
from .models import (
    Address, Cart, CartItem, Category, Collection, 
    ContactMessage, ContactMessageReply, HomeSection, HomeSectionCategory, 
    HomeSectionMedia, HomeSectionProduct, Media, ProductMedia,
    Notification, Order, Product, Wishlist, User
)
from .serializers import (
    AddressSerializer, CartItemSerializer, CartSerializer, 
    CategorySerializer, CollectionSerializer, ContactMessageSerializer, 
    ContactMessageReplySerializer, HomeSectionSerializer, LoginSerializer,
    NewsletterSubscriberSerializer, NotificationSerializer, 
    OrderSerializer, ProductSerializer, RegisterSerializer, UserSerializer
)
from .services import create_order


class MediaView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            media = Media.objects.get(pk=pk)
            # Ensure content is treated as bytes for the response
            content = media.content
            if isinstance(content, memoryview):
                content = content.tobytes()
            
            response = HttpResponse(content, content_type=media.content_type)
            response['Cache-Control'] = 'public, max-age=31536000'
            return response
        except Media.DoesNotExist:
            raise Http404


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": UserSerializer(user).data, 
            "access": str(RefreshToken.for_user(user).access_token), 
            "refresh": str(RefreshToken.for_user(user))
        }, status=status.HTTP_201_CREATED)


@api_view(["GET", "HEAD"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok"}, status=200)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    refresh = RefreshToken.for_user(serializer.validated_data["user"])
    return Response({
        "user": UserSerializer(serializer.validated_data["user"]).data, 
        "access": str(refresh.access_token), 
        "refresh": str(refresh)
    })


@api_view(["GET", "HEAD"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok"}, status=200)


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_view(request):
    form = PasswordResetForm(request.data)
    if not form.is_valid():
        return Response({"detail": "Enter a valid email address."}, status=status.HTTP_400_BAD_REQUEST)
    form.save(use_https=request.is_secure(), from_email=None, request=request)
    return Response({"detail": "Password reset email sent."})


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self): 
        return self.request.user


class CatalogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = self.queryset.filter(active=True)
        search = self.request.query_params.get("search")
        if search and hasattr(queryset.model, "name"):
            queryset = queryset.filter(name__icontains=search)
        return queryset


class ProductViewSet(CatalogViewSet):
    queryset = Product.objects.prefetch_related(
        Prefetch("product_media", queryset=ProductMedia.objects.select_related("media").defer("media__content")),
        "variants"
    ).select_related("category", "collection")
    serializer_class = ProductSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        
        # Search
        query = self.request.query_params.get("q")
        if query:
            from django.db.models import Q
            qs = qs.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(category__name__icontains=query) |
                Q(collection__name__icontains=query)
            )

        # Filters
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category__slug=category)
            
        collection = self.request.query_params.get("collection")
        if collection:
            qs = qs.filter(collection__slug=collection)
            
        min_price = self.request.query_params.get("min_price")
        if min_price:
            qs = qs.filter(price__gte=min_price)
            
        max_price = self.request.query_params.get("max_price")
        if max_price:
            qs = qs.filter(price__lte=max_price)

        is_new = self.request.query_params.get("is_new")
        if is_new:
            qs = qs.filter(is_new=True)

        # Sort
        sort = self.request.query_params.get("sort")
        if sort == "price_low":
            qs = qs.order_by("price")
        elif sort == "price_high":
            qs = qs.order_by("-price")
        elif sort == "newest":
            qs = qs.order_by("-created_at")

        return qs


class CollectionViewSet(CatalogViewSet):
    queryset = Collection.objects.select_related("media").defer("media__content").prefetch_related("products").all()
    serializer_class = CollectionSerializer


class CategoryViewSet(CatalogViewSet):
    queryset = Category.objects.select_related("media").defer("media__content").all()
    serializer_class = CategorySerializer


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer

    def get_queryset(self): 
        return Address.objects.filter(user=self.request.user).order_by("-is_default", "-created_at")

    def perform_create(self, serializer):
        if serializer.validated_data.get("is_default") or not self.get_queryset().exists():
            Address.objects.filter(user=self.request.user).update(is_default=False)
            serializer.save(user=self.request.user, is_default=True)
        else: 
            serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def default(self, request, pk=None):
        address = self.get_object()
        Address.objects.filter(user=request.user).update(is_default=False)
        address.is_default = True
        address.save(update_fields=["is_default"])
        return Response(AddressSerializer(address).data)


class CartView(generics.RetrieveUpdateAPIView):
    serializer_class = CartSerializer

    def get_object(self): 
        return Cart.objects.prefetch_related("items__product", "items__variant").get_or_create(user=self.request.user)[0]

    def update(self, request, *args, **kwargs):
        cart = self.get_object()
        CartItem.objects.filter(cart=cart).delete()
        for item_data in request.data.get("items", []):
            product_data = item_data.get("product", {})
            product_id = product_data.get("id") if isinstance(product_data, dict) else item_data.get("productId")
            if not product_id: 
                continue
            
            product = Product.objects.filter(id=product_id, active=True).first()
            if not product: 
                continue
            
            variant_id = item_data.get("variantId")
            if variant_id:
                variant = product.variants.filter(id=variant_id).first()
            else:
                variant = product.variants.filter(name=item_data.get("color", ""), size=item_data.get("size", "")).first()

            quantity = max(1, int(item_data.get("quantity", 1)))
            CartItem.objects.create(cart=cart, product=product, variant=variant, quantity=quantity)
        return Response(CartSerializer(self.get_object()).data)


class WishlistView(generics.RetrieveUpdateAPIView):
    def get_object(self): 
        return Wishlist.objects.get_or_create(user=self.request.user)[0]

    def retrieve(self, request, *args, **kwargs): 
        return Response({"product_ids": list(self.get_object().products.values_list("id", flat=True))})

    def update(self, request, *args, **kwargs):
        wishlist = self.get_object()
        wishlist.products.set(Product.objects.filter(id__in=request.data.get("product_ids", [])))
        return Response({"product_ids": list(wishlist.products.values_list("id", flat=True))})


class CartItemView(generics.CreateAPIView):
    serializer_class = CartItemSerializer

    def perform_create(self, serializer):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        product = serializer.validated_data["product"]
        variant = serializer.validated_data.get("variant")
        if variant and variant.product_id != product.id: 
            raise serializers.ValidationError("Variant does not belong to product.")
        item, created = CartItem.objects.get_or_create(cart=cart, product=product, variant=variant, defaults={"quantity": serializer.validated_data["quantity"]})
        if not created:
            item.quantity += serializer.validated_data["quantity"]
            item.save(update_fields=["quantity"])


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self): 
        return Order.objects.filter(user=self.request.user).prefetch_related("items")

    def create(self, request, *args, **kwargs):
        try:
            order = create_order(
                user=request.user, 
                items=request.data.get("items", []), 
                shipping=request.data.get("shippingAddress", {}), 
                payment_method=request.data.get("paymentMethod", "Cash on delivery"), 
                idempotency_key=request.data.get("idempotencyKey", "")
            )
            return Response(OrderSerializer(order, context={"request": request}).data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({"detail": str(e.detail[0]) if isinstance(e.detail, list) else str(e.detail)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self): 
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")

    @action(detail=True, methods=["post"])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=["post"])
    def read_all(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"detail": "Notifications marked as read."})


@api_view(["GET", "HEAD"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok"}, status=200)


@api_view(["POST"])
@permission_classes([AllowAny])
def newsletter_view(request):
    serializer = NewsletterSubscriberSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({"detail": "Subscribed."}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([AllowAny])
def home_view(request):
    now = timezone.now()
    sections = HomeSection.objects.filter(
        is_active=True
    ).filter(
        Q(start_date__isnull=True) | Q(start_date__lte=now)
    ).filter(
        Q(end_date__isnull=True) | Q(end_date__gte=now)
    ).select_related("media", "mobile_media", "collection").defer(
        "media__content", "mobile_media__content", "collection__media__content"
    ).prefetch_related(
        Prefetch("section_media", queryset=HomeSectionMedia.objects.select_related("media").defer("media__content")),
        Prefetch("section_products", queryset=HomeSectionProduct.objects.select_related("product").prefetch_related(
            Prefetch("product__product_media", queryset=ProductMedia.objects.select_related("media").defer("media__content")),
            "product__variants"
        )),
        Prefetch("section_categories", queryset=HomeSectionCategory.objects.select_related("category__media").defer("category__media__content"))
    )
    serializer = HomeSectionSerializer(sections, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def contact_view(request):
    serializer = ContactMessageSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user = request.user if request.user.is_authenticated else None
    message = serializer.save(user=user)
    
    # Create notification for admin
    admin_users = User.objects.filter(is_staff=True)
    for admin in admin_users:
        Notification.objects.create(
            user=admin,
            title="New Inquiry",
            message=f"New message from {message.name}: {message.subject}",
            url=f"/admin/messages"
        )
    
    return Response({"detail": "Message sent."}, status=status.HTTP_201_CREATED)


class MyContactMessageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ContactMessage.objects.prefetch_related("replies__sender").filter(user=self.request.user).order_by("-created_at")

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance.is_read_by_user:
            instance.is_read_by_user = True
            instance.save(update_fields=["is_read_by_user"])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

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
            is_admin=False
        )
        
        # Update message status and notify admin
        message.status = "in_progress"
        message.is_read = False
        message.save(update_fields=["status", "is_read", "updated_at"])
        
        admin_users = User.objects.filter(is_staff=True)
        for admin in admin_users:
            Notification.objects.create(
                user=admin,
                title="Customer Reply",
                message=f"{message.name} replied to: {message.subject}",
                url=f"/admin/messages"
            )
            
        return Response({"detail": "Reply sent."}, status=201)
