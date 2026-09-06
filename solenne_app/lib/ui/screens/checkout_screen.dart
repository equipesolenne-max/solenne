import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_text_field.dart';
import '../components/solenne_button.dart';
import '../components/solenne_price.dart';
import '../../state/cart_state.dart';
import '../../state/auth_state.dart';
import '../../services/order_repository.dart';
import '../../models/order_model.dart';
import 'order_confirmation_screen.dart';

/// Simple, single-flow checkout. Reuses the existing website's delivery
/// model (Wilaya, Commune, address, phone) and order structure — this
/// does not invent new checkout logic.
class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _wilayaController = TextEditingController();
  final _communeController = TextEditingController();
  final _addressController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _submitting = false;

  static const double _shipping = 400;

  Future<void> _placeOrder() async {
    final cart = context.read<CartState>();
    final auth = context.read<AuthState>();
    if (cart.lines.isEmpty) return;

    setState(() => _submitting = true);
    try {
      final orderData = {
        'idempotencyKey': 'order_${DateTime.now().millisecondsSinceEpoch}_${auth.user?.id}',
        'items': cart.lines
            .map((l) => {
                  'productId': l.product.id,
                  'color': l.variantName,
                  'quantity': l.quantity,
                })
            .toList(),
        'shippingAddress': {
          'name': auth.user?.name ?? 'Customer',
          'wilaya': _wilayaController.text.trim(),
          'commune': _communeController.text.trim(),
          'address': _addressController.text.trim(),
          'phone': _phoneController.text.trim(),
        },
        'paymentMethod': 'Cash on delivery',
      };
      
      final order = await context.read<OrderRepository>().createOrder(orderData);
      cart.clearLocal();
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => OrderConfirmationScreen(orderId: order.id)),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to place order: $e')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartState>();

    return Scaffold(
      appBar: AppBar(title: Text('CHECKOUT', style: SolenneTypography.sectionTitle())),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(SolenneSpacing.pageHorizontal),
          children: [
            Text('DELIVERY DETAILS', style: SolenneTypography.label(color: SolenneColors.muted)),
            const SizedBox(height: SolenneSpacing.md),
            SolenneTextField(label: 'Wilaya', controller: _wilayaController),
            const SizedBox(height: SolenneSpacing.md),
            SolenneTextField(label: 'Commune', controller: _communeController),
            const SizedBox(height: SolenneSpacing.md),
            SolenneTextField(label: 'Address', controller: _addressController),
            const SizedBox(height: SolenneSpacing.md),
            SolenneTextField(label: 'Phone', controller: _phoneController, keyboardType: TextInputType.phone),
            const SizedBox(height: SolenneSpacing.xl),
            Text('ORDER SUMMARY', style: SolenneTypography.label(color: SolenneColors.muted)),
            const SizedBox(height: SolenneSpacing.md),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Subtotal', style: SolenneTypography.body(color: SolenneColors.muted)),
                SolennePrice(amount: cart.subtotal, fontSize: 14),
              ],
            ),
            const SizedBox(height: SolenneSpacing.sm),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Shipping', style: SolenneTypography.body(color: SolenneColors.muted)),
                SolennePrice(amount: _shipping, fontSize: 14),
              ],
            ),
            const Divider(height: SolenneSpacing.xl),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total', style: SolenneTypography.productName(fontSize: 15)),
                SolennePrice(amount: cart.subtotal + _shipping, fontSize: 16),
              ],
            ),
            const SizedBox(height: SolenneSpacing.xl),
            SolenneButton(label: 'Place Order', loading: _submitting, onPressed: _placeOrder),
          ],
        ),
      ),
    );
  }
}
