from django.conf import settings
from django.core.mail import send_mail
from .models import Notification, Order


def send_order_confirmation(order: Order):
    send_mail(f"Order Confirmation - {order.order_number}", f"Your order {order.order_number} has been received. Total: {order.total} DZD.", settings.DEFAULT_FROM_EMAIL, [order.email], fail_silently=False)


def notify_order_status(order: Order):
    Notification.objects.create(user=order.user, title=f"Order {order.order_number} updated", message=f"Your order status is now {order.status}.", url=f"/orders/{order.pk}")
    send_mail(f"Your order {order.order_number} is {order.status}", f"Your Solenne order status is now {order.status}.", settings.DEFAULT_FROM_EMAIL, [order.email], fail_silently=True)


def send_reply_notification(message, reply_text):
    subject = f"Reply to your inquiry: {message.subject}"
    body = f"Hello {message.name},\n\nThe Solenne atelier has replied to your message:\n\n{reply_text}\n\nYou can view the full conversation history in your account dashboard if you were logged in when you sent the message.\n\nBest regards,\nSolenne Atelier"
    send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [message.email], fail_silently=True)
