from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Address, Category, Collection, ContactMessage, NewsletterSubscriber, Order, OrderItem, Product, ProductVariant, StoreSettings, User, ShippingRate

class StoreUserAdmin(UserAdmin):
	ordering = ("email",)
	list_display = ("email", "first_name", "last_name", "is_staff", "is_active")


class ShippingRateAdmin(admin.ModelAdmin):
	list_display = ("wilaya_code", "wilaya_name", "home_delivery_price", "stop_desk_price", "is_active")
	list_editable = ("home_delivery_price", "stop_desk_price", "is_active")


admin.site.register(User, StoreUserAdmin)
admin.site.register([Address, Category, Collection, ContactMessage, NewsletterSubscriber, Order, OrderItem, Product, ProductVariant, StoreSettings])
admin.site.register(ShippingRate, ShippingRateAdmin)
