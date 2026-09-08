from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .admin_api import (
    AdminCategoryViewSet, AdminCollectionViewSet, AdminContactMessageViewSet, 
    AdminHomeSectionViewSet, AdminNotificationViewSet, AdminOrderViewSet, 
    AdminProductViewSet, AdminSettingsViewSet, AdminUserViewSet, MediaViewSet, dashboard_view
)

router = DefaultRouter()
router.register("products", AdminProductViewSet, basename="admin-product")
router.register("categories", AdminCategoryViewSet, basename="admin-category")
router.register("collections", AdminCollectionViewSet, basename="admin-collection")
router.register("home-sections", AdminHomeSectionViewSet, basename="admin-home-section")
router.register("orders", AdminOrderViewSet, basename="admin-order")
router.register("users", AdminUserViewSet, basename="admin-user")
router.register("contact-messages", AdminContactMessageViewSet, basename="admin-contact-message")
router.register("notifications", AdminNotificationViewSet, basename="admin-notification")
router.register("settings", AdminSettingsViewSet, basename="admin-settings")
router.register("media", MediaViewSet, basename="admin-media")

urlpatterns = [path("dashboard/", dashboard_view), path("", include(router.urls))]
