from django.contrib.auth import authenticate
from django.urls import reverse
from rest_framework import serializers
from .models import (
    Address, Cart, CartItem, Category, Collection, 
    ContactMessage, ContactMessageReply, Media, 
    NewsletterSubscriber, Notification, Order, 
    OrderItem, Product, ProductMedia, ProductVariant, User
)


def get_media_url(media, request):
    if not media:
        return None
    url = reverse("media", args=[media.id])
    if request:
        return request.build_absolute_uri(url)
    return url


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "phone", "is_staff")
        read_only_fields = ("id", "email", "is_staff")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("email", "password", "first_name", "last_name", "phone")

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(email=attrs["email"], password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        attrs["user"] = user
        return attrs


class VariantSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = ("id", "name", "hex", "images", "stock", "sku")

    def get_images(self, obj):
        request = self.context.get("request")
        return [
            get_media_url(pm.media, request) 
            for pm in obj.product_media.all().select_related("media")
        ]


class ProductMediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductMedia
        fields = ("id", "product", "variant", "media", "url", "is_primary", "position", "created_at")
        read_only_fields = ("id", "created_at")

    def get_url(self, obj):
        return get_media_url(obj.media, self.context.get("request"))


class ProductSerializer(serializers.ModelSerializer):
    variants = VariantSerializer(many=True, read_only=True)
    category = serializers.CharField(source="category.name", read_only=True)
    collection = serializers.CharField(source="collection.name", read_only=True)
    images = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id", "legacy_id", "name", "slug", "description", 
            "price", "compare_at_price", "currency", "material", 
            "dimensions", "stock", "featured", "bestseller", 
            "is_new", "active", "images", "category", 
            "collection", "variants", "created_at"
        )

    def get_images(self, obj):
        request = self.context.get("request")
        # Return base product images (those without a specific variant)
        return [
            get_media_url(pm.media, request) 
            for pm in obj.product_media.filter(variant=None).select_related("media")
        ]


class CollectionSerializer(serializers.ModelSerializer):
    product_ids = serializers.PrimaryKeyRelatedField(source="products", many=True, read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = ("id", "legacy_id", "name", "slug", "description", "image", "active", "product_ids", "created_at")

    def get_image(self, obj):
        return get_media_url(obj.media, self.context.get("request"))


class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "legacy_id", "name", "slug", "description", "image", "active", "created_at")

    def get_image(self, obj):
        return get_media_url(obj.media, self.context.get("request"))


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ("id", "full_name", "phone", "address", "wilaya", "commune", "postal_code", "is_default", "created_at")
        read_only_fields = ("id", "created_at")


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(source="product", queryset=Product.objects.filter(active=True), write_only=True)
    variant_id = serializers.PrimaryKeyRelatedField(source="variant", queryset=ProductVariant.objects.all(), write_only=True, required=False, allow_null=True)

    class Meta:
        model = CartItem
        fields = ("id", "product", "product_id", "variant_id", "quantity")


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ("id", "items", "updated_at")


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ("product", "name", "color", "image", "quantity", "price", "subtotal")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    date = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id", "order_number", "customer", "email", "phone", 
            "date", "subtotal", "shipping_cost", "total", 
            "payment_method", "payment_status", "status", 
            "shipping", "items", "created_at", "updated_at"
        )

    def get_date(self, obj):
        return obj.created_at.date().isoformat()


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ("id", "email", "created_at")
        read_only_fields = ("id", "created_at")


class ContactMessageReplySerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.first_name", read_only=True)

    class Meta:
        model = ContactMessageReply
        fields = ("id", "message", "sender", "sender_name", "text", "is_admin", "created_at")
        read_only_fields = ("id", "sender", "is_admin", "created_at")


class ContactMessageSerializer(serializers.ModelSerializer):
    replies = ContactMessageReplySerializer(many=True, read_only=True)

    class Meta:
        model = ContactMessage
        fields = ("id", "user", "name", "email", "subject", "message", "status", "is_read", "is_read_by_user", "replies", "created_at", "updated_at")
        read_only_fields = ("id", "user", "created_at", "updated_at")


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ("id", "title", "message", "url", "is_read", "created_at")
        read_only_fields = ("id", "created_at")
