from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .admin_api import AdminCategoryViewSet, AdminCollectionViewSet, AdminContactMessageViewSet, AdminNotificationViewSet, AdminOrderViewSet, AdminProductViewSet, AdminSettingsViewSet, AdminUserViewSet, dashboard_view

router = DefaultRouter()
router.register("products", AdminProductViewSet, basename="admin-product")
router.register("categories", AdminCategoryViewSet, basename="admin-category")
router.register("collections", AdminCollectionViewSet, basename="admin-collection")
router.register("orders", AdminOrderViewSet, basename="admin-order")
router.register("users", AdminUserViewSet, basename="admin-user")
router.register("contact-messages", AdminContactMessageViewSet, basename="admin-contact-message")
router.register("notifications", AdminNotificationViewSet, basename="admin-notification")
router.register("settings", AdminSettingsViewSet, basename="admin-settings")

urlpatterns = [path("dashboard/", dashboard_view), path("", include(router.urls))]
