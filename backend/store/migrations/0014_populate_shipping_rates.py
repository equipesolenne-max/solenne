from django.db import migrations

def populate_rates(apps, schema_editor):
    ShippingRate = apps.get_model('store', 'ShippingRate')
    rates = [
        (35, 'Boumerdès', 500, 300, 300),
        (16, 'Alger', 600, 400, 300),
        (9, 'Blida', 600, 400, 300),
        (42, 'Tipaza', 600, 400, 300),
        (15, 'Tizi Ouzou', 700, 450, 300),
        (10, 'Bouira', 700, 450, 300),
        (26, 'Médéa', 700, 450, 300),
        (6, 'Béjaïa', 800, 500, 300),
        (31, 'Oran', 800, 500, 300),
        (25, 'Constantine', 800, 500, 300),
        (19, 'Sétif', 800, 500, 300),
        (23, 'Annaba', 800, 500, 300),
        (13, 'Tlemcen', 800, 500, 300),
        (14, 'Tiaret', 900, 600, 300),
        (17, 'Djelfa', 1000, 600, 300),
        (7, 'Biskra', 1000, 600, 300),
        (47, 'Ghardaïa', 1100, 700, 300),
        (30, 'Ouargla', 1100, 700, 300),
        (39, 'El Oued', 1100, 700, 300),
        (32, 'El Bayadh', 1200, 800, 300),
        (8, 'Béchar', 1200, 800, 300),
        (1, 'Adrar', 1500, 1000, 300),
        (37, 'Tindouf', 1700, 1000, 300),
        (53, 'In Salah', 1800, 1200, 300),
        (33, 'Illizi', 1900, 1500, 300),
        (11, 'Tamanrasset', 2000, 1500, 300),
        (56, 'Djanet', 2200, 1600, 300),
    ]
    for code, name, home, stop, ret in rates:
        ShippingRate.objects.get_or_create(
            wilaya_code=code,
            defaults={
                'wilaya_name': name,
                'home_delivery_price': home,
                'stop_desk_price': stop,
                'return_price': ret
            }
        )

class Migration(migrations.Migration):
    dependencies = [
        ('store', '0013_shippingrate_order_delivery_method'),
    ]
    operations = [
        migrations.RunPython(populate_rates),
    ]
