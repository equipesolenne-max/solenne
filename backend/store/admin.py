from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Address, Category, Collection, ContactMessage, NewsletterSubscriber, Order, OrderItem, Product, ProductVariant, StoreSettings, User

class StoreUserAdmin(UserAdmin):
	ordering = ("email",)
	list_display = ("email", "first_name", "last_name", "is_staff", "is_active")


admin.site.register(User, StoreUserAdmin)
admin.site.register([Address, Category, Collection, ContactMessage, NewsletterSubscriber, Order, OrderItem, Product, ProductVariant, StoreSettings])
