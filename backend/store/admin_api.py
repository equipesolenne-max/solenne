from django.db.models import Sum, Count, Q, Prefetch
from django.urls import reverse
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .models import (
    Category, Collection, ContactMessage, ContactMessageReply, 
    HomeSection, HomeSectionCategory, HomeSectionMedia, HomeSectionProduct, 
    Media, Notification, Order, OrderStatusHistory, 
    Product, ProductMedia, ProductVariant, StoreSettings, User
)
from .serializers import (
    CategorySerializer, CollectionSerializer, ContactMessageSerializer, 
    ContactMessageReplySerializer, HomeSectionSerializer, MediaSerializer, NotificationSerializer, 
    OrderSerializer, ProductMediaSerializer, ProductSerializer, UserSerializer, VariantSerializer
)
from .email_service import notify_order_status, send_reply_notification


class AdminProductSerializer(ProductSerializer):
    category_id = serializers.PrimaryKeyRelatedField(source="category", queryset=Category.objects.all(), required=False, allow_null=True, write_only=True)
    collection_id = serializers.PrimaryKeyRelatedField(source="collection", queryset=Collection.objects.all(), required=False, allow_null=True, write_only=True)

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ("category_id", "collection_id")


class AdminProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Product.objects.prefetch_related(
        Prefetch("product_media", queryset=ProductMedia.objects.select_related("media").defer("media__content")),
        "variants"
    ).select_related("category", "collection")
    serializer_class = AdminProductSerializer

    @action(detail=True, methods=["post"], url_path="stock")
    def stock(self, request, pk=None):
        product = self.get_object()
        if "stock" in request.data:
            product.stock = max(0, int(request.data["stock"]))
            product.save(update_fields=["stock"])
        return Response(AdminProductSerializer(product).data)

    @action(detail=True, methods=["post"], url_path="variants")
    def variants(self, request, pk=None):
        product = self.get_object()
        variant, _ = ProductVariant.objects.update_or_create(
            product=product, 
            name=request.data["name"], 
            defaults={
                "hex": request.data.get("hex", "#C6A369"), 
                "stock": max(0, int(request.data.get("stock", 0))), 
                "sku": request.data.get("sku", "")
            }
        )
        return Response(VariantSerializer(variant, context={"request": request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="images", parser_classes=[MultiPartParser, FormParser])
    def images(self, request, pk=None):
        product = self.get_object()
        uploaded = request.FILES.get("image")
        variant_id = request.data.get("variant_id")
        
        if not uploaded:
            return Response({"detail": "image is required."}, status=400)
            
        # Create Media record
        media = Media.objects.create(
            name=uploaded.name,
            content=uploaded.read(),
            content_type=uploaded.content_type
        )

        # Handle variant association
        variant = None
        if variant_id:
            variant = product.variants.filter(id=variant_id).first()
            if not variant:
                variant = product.variants.filter(name=variant_id).first()

        pm = ProductMedia.objects.create(
            product=product,
            variant=variant,
            media=media,
            is_primary=not product.product_media.filter(variant=variant).exists(),
            position=product.product_media.filter(variant=variant).count()
        )
        
        return Response(ProductMediaSerializer(pm, context={"request": request}).data, status=201)

    @action(detail=True, methods=["delete"], url_path=r"images/(?P<pm_id>[^/.]+)")
    def delete_image(self, request, pk=None, pm_id=None):
        pm = ProductMedia.objects.filter(product_id=pk, pk=pm_id).first()
        if not pm:
            return Response({"detail": "Media relation not found."}, status=404)
        
        media = pm.media
        pm.delete()
        
        # If media is no longer used anywhere, we could delete it too
        if not ProductMedia.objects.filter(media=media).exists() and \
           not Category.objects.filter(media=media).exists() and \
           not Collection.objects.filter(media=media).exists():
            media.delete()
            
        return Response(status=204)


class AdminCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Category.objects.select_related("media").defer("media__content").all()
    serializer_class = CategorySerializer

    def perform_create(self, serializer):
        image_file = self.request.FILES.get("image")
        media = None
        if image_file:
            media = Media.objects.create(
                name=image_file.name,
                content=image_file.read(),
                content_type=image_file.content_type
            )
        serializer.save(media=media)

    def perform_update(self, serializer):
        image_file = self.request.FILES.get("image")
        if image_file:
            media = Media.objects.create(
                name=image_file.name,
                content=image_file.read(),
                content_type=image_file.content_type
            )
            serializer.save(media=media)
        else:
            serializer.save()


class AdminCollectionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Collection.objects.select_related("media").defer("media__content").prefetch_related("products").all()
    serializer_class = CollectionSerializer

    def perform_create(self, serializer):
        image_file = self.request.FILES.get("image")
        media = None
        if image_file:
            media = Media.objects.create(
                name=image_file.name,
                content=image_file.read(),
                content_type=image_file.content_type
            )
        serializer.save(media=media)

    def perform_update(self, serializer):
        image_file = self.request.FILES.get("image")
        if image_file:
            media = Media.objects.create(
                name=image_file.name,
                content=image_file.read(),
                content_type=image_file.content_type
            )
            serializer.save(media=media)
        else:
            serializer.save()


class AdminHomeSectionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = HomeSection.objects.select_related("media", "mobile_media", "collection").defer("media__content", "mobile_media__content", "collection__media__content").prefetch_related(
        Prefetch("section_media", queryset=HomeSectionMedia.objects.select_related("media").defer("media__content")),
        Prefetch("section_products", queryset=HomeSectionProduct.objects.select_related("product")),
        Prefetch("section_categories", queryset=HomeSectionCategory.objects.select_related("category__media").defer("category__media__content"))
    ).all()
    serializer_class = HomeSectionSerializer

    @action(detail=True, methods=["post"], url_path="items")
    def update_items(self, request, pk=None):
        section = self.get_object()
        item_type = request.data.get("type")
        item_ids = request.data.get("ids", [])
        
        if item_type == "product":
            section.section_products.all().delete()
            for idx, pid in enumerate(item_ids):
                HomeSectionProduct.objects.create(section=section, product_id=pid, position=idx)
        elif item_type == "category":
            section.section_categories.all().delete()
            for idx, cid in enumerate(item_ids):
                HomeSectionCategory.objects.create(section=section, category_id=cid, position=idx)
        elif item_type == "media":
            section.section_media.all().delete()
            for idx, mid in enumerate(item_ids):
                HomeSectionMedia.objects.create(section=section, media_id=mid, position=idx)
        
        return Response(HomeSectionSerializer(section, context={"request": request}).data)

    @action(detail=False, methods=["post"], url_path="reorder")
    def reorder(self, request):
        order_data = request.data.get("order", [])
        for idx, sid in enumerate(order_data):
            HomeSection.objects.filter(pk=sid).update(position=idx)
        return Response({"status": "reordered"})


class MediaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]
    queryset = Media.objects.defer("content").all()
    serializer_class = MediaSerializer

    def create(self, request, *args, **kwargs):
        uploaded = request.FILES.get("image")
        if not uploaded:
            return Response({"detail": "image is required."}, status=400)
        media = Media.objects.create(
            name=uploaded.name,
            content=uploaded.read(),
            content_type=uploaded.content_type
        )
        serializer = self.get_serializer(media)
        return Response(serializer.data, status=201)


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
        
        message.status = "replied"
        message.is_read = True
        message.is_read_by_user = False
        message.save(update_fields=["status", "is_read", "is_read_by_user", "updated_at"])
        
        send_reply_notification(message, text)
        
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
    return Response({
        "totalRevenue": orders.aggregate(total=Sum("total"))["total"] or 0, 
        "totalOrders": orders.count(), 
        "totalCustomers": User.objects.filter(is_staff=False).count(), 
        "totalProducts": Product.objects.count(), 
        "pendingOrders": orders.filter(status="pending").count(), 
        "lowStockProducts": Product.objects.filter(stock__lte=5).count()
    })


class AdminSettingsViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    def list(self, request):
        settings = StoreSettings.objects.filter(key="store").first()
        return Response(settings.data if settings else {})

    def update(self, request, pk=None):
        settings, _ = StoreSettings.objects.update_or_create(key="store", defaults={"data": request.data})
        return Response(settings.data)
