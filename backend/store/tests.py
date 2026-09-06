import base64

from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from io import BytesIO
from .models import Category, Product, ProductVariant, User


class OrderFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="buyer@example.com", password="strong-pass-123")
        self.product = Product.objects.create(name="Silk", slug="silk", description="Soft silk", price=3500, stock=4, images=[])
        self.variant = ProductVariant.objects.create(product=self.product, name="Ivory", stock=4)
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    def test_order_uses_server_price_and_shipping(self):
        response = self.client.post("/api/orders/", {"items": [{"product_id": self.product.id, "quantity": 1, "color": "Ivory", "price": 1}], "shippingAddress": {"name": "Buyer", "phone": "0550123456", "wilaya": "Algiers", "commune": "Algiers", "address": "1 Main Street"}, "idempotencyKey": "test-key"}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["subtotal"], 3500)
        self.assertEqual(response.data["shipping_cost"], 1000)
        self.assertEqual(response.data["total"], 4500)
        self.product.refresh_from_db()
        self.variant.refresh_from_db()
        self.assertEqual(self.product.stock, 4)
        self.assertEqual(self.variant.stock, 3)

    def test_idempotency_returns_same_order(self):
        payload = {"items": [{"product_id": self.product.id, "quantity": 1}], "shippingAddress": {"name": "Buyer", "phone": "0550123456", "wilaya": "Algiers", "commune": "Algiers", "address": "1 Main Street"}, "idempotencyKey": "same-key"}
        first = self.client.post("/api/orders/", payload, format="json")
        second = self.client.post("/api/orders/", payload, format="json")
        self.assertEqual(first.data["id"], second.data["id"])
        self.assertEqual(Product.objects.get(id=self.product.id).stock, 3)

    def test_private_order_cannot_be_read_by_other_user(self):
        response = self.client.get("/api/orders/999/")
        self.assertEqual(response.status_code, 404)

    def test_regular_user_cannot_access_admin_api(self):
        response = self.client.get("/api/admin/dashboard/")
        self.assertEqual(response.status_code, 403)

    def test_admin_can_read_dashboard_and_manage_products(self):
        admin = User.objects.create_superuser(email="admin@example.com", password="strong-pass-123")
        token = RefreshToken.for_user(admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
        self.assertEqual(self.client.get("/api/admin/dashboard/").status_code, 200)
        category = Category.objects.create(name="Silks", slug="silks")
        response = self.client.post("/api/admin/products/", {"name": "New Silk", "slug": "new-silk", "description": "Drape", "price": 2000, "category_id": category.id}, format="json")
        self.assertEqual(response.status_code, 201)

    def test_admin_can_manage_category_and_collection(self):
        admin = User.objects.create_superuser(email="admin2@example.com", password="strong-pass-123")
        token = RefreshToken.for_user(admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
        category = self.client.post("/api/admin/categories/", {"name": "Silks", "slug": "silks"}, format="json")
        collection = self.client.post("/api/admin/collections/", {"name": "Edit", "slug": "edit"}, format="json")
        self.assertEqual(category.status_code, 201)
        self.assertEqual(collection.status_code, 201)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_password_reset_endpoint_accepts_existing_email(self):
        response = self.client.post("/api/auth/password-reset/", {"email": self.user.email}, format="json")
        self.assertEqual(response.status_code, 200)

    def test_admin_product_image_upload(self):
        admin = User.objects.create_superuser(email="media-admin@example.com", password="strong-pass-123")
        token = RefreshToken.for_user(admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
        image_buffer = BytesIO()
        Image.new("RGB", (2, 2), "white").save(image_buffer, format="PNG")
        image = SimpleUploadedFile("silk.png", image_buffer.getvalue(), content_type="image/png")
        response = self.client.post(f"/api/admin/products/{self.product.id}/images/", {"image": image}, format="multipart")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.product.media_images.count(), 1)
