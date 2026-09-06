from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager
from django.db import models


class EmailUserManager(UserManager):
    def create_user(self, email, password=None, **extra_fields):
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=32, blank=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    objects = EmailUserManager()
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []


class Category(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="categories/", blank=True, null=True)
    active = models.BooleanField(default=True)
    legacy_id = models.CharField(max_length=128, blank=True, unique=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Collection(models.Model):
    name = models.CharField(max_length=160)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="collections/", blank=True, null=True)
    active = models.BooleanField(default=True)
    legacy_id = models.CharField(max_length=128, blank=True, unique=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.PositiveIntegerField()
    compare_at_price = models.PositiveIntegerField(default=0)
    currency = models.CharField(max_length=8, default="DZD")
    material = models.CharField(max_length=160, blank=True)
    dimensions = models.CharField(max_length=160, blank=True)
    stock = models.PositiveIntegerField(default=0)
    featured = models.BooleanField(default=False)
    bestseller = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    images = models.JSONField(default=list, blank=True)
    category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL, related_name="products")
    collection = models.ForeignKey(Collection, null=True, blank=True, on_delete=models.SET_NULL, related_name="products")
    legacy_id = models.CharField(max_length=128, blank=True, unique=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    name = models.CharField(max_length=100)
    hex = models.CharField(max_length=7, default="#C6A369")
    images = models.JSONField(default=list, blank=True)
    stock = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=100, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["product", "name"], name="unique_product_variant")]


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="media_images")
    variant = models.ForeignKey(ProductVariant, null=True, blank=True, on_delete=models.CASCADE, related_name="media_images")
    image = models.ImageField(upload_to="products/%Y/%m/")
    is_primary = models.BooleanField(default=False)
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses")
    full_name = models.CharField(max_length=160)
    phone = models.CharField(max_length=32)
    address = models.TextField()
    wilaya = models.CharField(max_length=120)
    commune = models.CharField(max_length=120)
    postal_code = models.CharField(max_length=20, blank=True)
    is_default = models.BooleanField(default=False)
    legacy_id = models.CharField(max_length=128, blank=True, unique=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cart")
    updated_at = models.DateTimeField(auto_now=True)


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, null=True, blank=True, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    class Meta:
        constraints = [models.UniqueConstraint(fields=["cart", "product", "variant"], name="unique_cart_line")]


class Wishlist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="wishlist")
    products = models.ManyToManyField(Product, blank=True)
    updated_at = models.DateTimeField(auto_now=True)


class Order(models.Model):
    STATUS = [(value, value) for value in ("pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned")]
    PAYMENT_STATUS = [(value, value) for value in ("pending", "paid", "refunded")]
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name="orders")
    order_number = models.CharField(max_length=32, unique=True)
    customer = models.CharField(max_length=160)
    email = models.EmailField()
    phone = models.CharField(max_length=32)
    subtotal = models.PositiveIntegerField()
    shipping_cost = models.PositiveIntegerField()
    total = models.PositiveIntegerField()
    payment_method = models.CharField(max_length=80, default="Cash on delivery")
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default="pending")
    status = models.CharField(max_length=20, choices=STATUS, default="pending")
    shipping = models.JSONField(default=dict)
    legacy_id = models.CharField(max_length=128, blank=True, unique=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=200)
    color = models.CharField(max_length=100, blank=True)
    image = models.URLField(blank=True)
    quantity = models.PositiveIntegerField()
    price = models.PositiveIntegerField()
    subtotal = models.PositiveIntegerField()


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="status_history")
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class IdempotencyKey(models.Model):
    key = models.CharField(max_length=160, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StoreSettings(models.Model):
    key = models.CharField(max_length=40, unique=True, default="store")
    data = models.JSONField(default=dict)


class ContactMessage(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="contact_messages")
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField(max_length=2000)
    status = models.CharField(max_length=20, default="new")
    is_read = models.BooleanField(default=False) # For Admin
    is_read_by_user = models.BooleanField(default=True) # For Customer
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ContactMessageReply(models.Model):
    message = models.ForeignKey(ContactMessage, on_delete=models.CASCADE, related_name="replies")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField(max_length=2000)
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=200)
    message = models.TextField()
    url = models.CharField(max_length=300, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
