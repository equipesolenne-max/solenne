from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    AddressViewSet, CartItemView, CartView, CategoryViewSet, 
    CollectionViewSet, MediaView, MyContactMessageViewSet, 
    NotificationViewSet, OrderViewSet, ProductViewSet, 
    WishlistView, contact_view, home_view, newsletter_view,
    ShippingRateViewSet
)

router = DefaultRouter()
router.register("products", ProductViewSet, basename="product")
router.register("collections", CollectionViewSet, basename="collection")
router.register("categories", CategoryViewSet, basename="category")
router.register("addresses", AddressViewSet, basename="address")
router.register("orders", OrderViewSet, basename="order")
router.register("notifications", NotificationViewSet, basename="notification")
router.register("contact-messages", MyContactMessageViewSet, basename="my-contact-message")
router.register("shipping/rates", ShippingRateViewSet, basename="shipping-rate")

urlpatterns = [
    # Explicit routes first to avoid router shadowing
    path("media/<uuid:pk>/", MediaView.as_view(), name="media"),
    path("home/", home_view, name="home"),
    path("cart/", CartView.as_view()),
    path("cart/items/", CartItemView.as_view()),
    path("wishlist/", WishlistView.as_view()),
    path("newsletter/subscribe/", newsletter_view),
    path("contact/", contact_view),
    
    # Router fallback
    path("", include(router.urls)),
]
