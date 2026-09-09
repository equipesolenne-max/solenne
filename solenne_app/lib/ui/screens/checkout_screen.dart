import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_text_field.dart';
import '../components/solenne_button.dart';
import '../components/solenne_price.dart';
import '../../state/cart_state.dart';
import '../../state/auth_state.dart';
import '../../state/address_state.dart';
import '../../services/order_repository.dart';
import '../../services/shipping_repository.dart';
import '../../models/shipping_rate_model.dart';
import 'order_confirmation_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _wilayaController = TextEditingController();
  final _communeController = TextEditingController();
  final _addressController = TextEditingController();
  
  String _deliveryMethod = 'home_delivery'; // 'home_delivery' or 'stop_desk'
  List<ShippingRateModel> _rates = [];
  bool _submitting = false;
  bool _loadingRates = true;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    final auth = context.read<AuthState>();
    final addressState = context.read<AddressState>();
    final shippingRepo = context.read<ShippingRepository>();

    _nameController.text = auth.user?.name ?? '';
    
    // Load rates
    final rates = await shippingRepo.getRates();
    if (mounted) {
      setState(() {
        _rates = rates;
        _loadingRates = false;
      });
    }

    // Load addresses if signed in
    if (auth.isSignedIn) {
      await addressState.fetchAddresses();
      if (addressState.addresses.isNotEmpty) {
        final def = addressState.addresses.firstWhere((a) => a.isDefault, orElse: () => addressState.addresses.first);
        if (mounted) {
          setState(() {
            _nameController.text = def.fullName;
            _phoneController.text = def.phone;
            _wilayaController.text = def.wilaya;
            _communeController.text = def.commune;
            _addressController.text = def.address;
          });
        }
      }
    }
  }

  double get _shippingCost {
    final cartSubtotal = context.read<CartState>().subtotal;
    if (cartSubtotal >= 5000) return 0;
    
    final rate = _rates.firstWhere(
      (r) => r.wilayaName.toLowerCase() == _wilayaController.text.trim().toLowerCase(),
      orElse: () => ShippingRateModel(wilayaCode: 0, wilayaName: '', homeDeliveryPrice: 1000, stopDeskPrice: 1000, returnPrice: 300, isActive: true),
    );

    return _deliveryMethod == 'home_delivery' ? rate.homeDeliveryPrice.toDouble() : rate.stopDeskPrice.toDouble();
  }

  Future<void> _placeOrder() async {
    final cart = context.read<CartState>();
    final auth = context.read<AuthState>();
    if (cart.lines.isEmpty) return;

    if (_wilayaController.text.isEmpty || _addressController.text.isEmpty || _phoneController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Veuillez remplir tous les champs obligatoires')));
      return;
    }

    setState(() => _submitting = true);
    try {
      final orderData = {
        'idempotencyKey': 'order_${DateTime.now().millisecondsSinceEpoch}_${auth.user?.id}',
        'items': cart.lines.map((l) => {
          'productId': l.product.id,
          'variantId': l.variantId,
          'color': l.variantName,
          'quantity': l.quantity,
        }).toList(),
        'shippingAddress': {
          'name': _nameController.text.trim(),
          'wilaya': _wilayaController.text.trim(),
          'commune': _communeController.text.trim(),
          'address': _addressController.text.trim(),
          'phone': _phoneController.text.trim(),
          'deliveryMethod': _deliveryMethod,
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
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur : $e')));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartState>();

    return Scaffold(
      appBar: AppBar(title: Text('PAIEMENT', style: SolenneTypography.sectionTitle())),
      body: _loadingRates 
        ? const Center(child: CircularProgressIndicator(strokeWidth: 1))
        : SafeArea(
            child: ListView(
              padding: const EdgeInsets.all(SolenneSpacing.pageHorizontal),
              children: [
                _buildSectionTitle('INFORMATIONS DE LIVRAISON'),
                const SizedBox(height: SolenneSpacing.md),
                SolenneTextField(label: 'Nom complet', controller: _nameController),
                const SizedBox(height: SolenneSpacing.md),
                SolenneTextField(label: 'Téléphone', controller: _phoneController, keyboardType: TextInputType.phone),
                const SizedBox(height: SolenneSpacing.md),
                SolenneTextField(
                  label: 'Wilaya', 
                  controller: _wilayaController,
                  onChanged: (_) => setState(() {}),
                ),
                const SizedBox(height: SolenneSpacing.md),
                SolenneTextField(label: 'Commune', controller: _communeController),
                const SizedBox(height: SolenneSpacing.md),
                SolenneTextField(label: 'Adresse exacte', controller: _addressController, maxLines: 2),
                
                const SizedBox(height: SolenneSpacing.xl),
                _buildSectionTitle('MODE DE LIVRAISON'),
                const SizedBox(height: SolenneSpacing.md),
                _buildDeliveryMethodSelector(),

                const SizedBox(height: SolenneSpacing.xl),
                _buildSectionTitle('RÉSUMÉ DE LA COMMANDE'),
                const SizedBox(height: SolenneSpacing.md),
                _buildSummaryRow('Sous-total', cart.subtotal),
                const SizedBox(height: SolenneSpacing.sm),
                _buildSummaryRow(
                  'Livraison ${_deliveryMethod == 'stop_desk' ? "(Stop Desk)" : "(Domicile)"}', 
                  _shippingCost
                ),
                const Divider(height: SolenneSpacing.xl),
                _buildSummaryRow('Total', cart.subtotal + _shippingCost, isTotal: true),
                
                const SizedBox(height: SolenneSpacing.xl),
                SolenneButton(
                  label: 'CONFIRMER LA COMMANDE', 
                  loading: _submitting, 
                  onPressed: _placeOrder
                ),
                const SizedBox(height: SolenneSpacing.xxl),
              ],
            ),
          ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: SolenneTypography.label(color: SolenneColors.muted, fontSize: 11));
  }

  Widget _buildDeliveryMethodSelector() {
    return Row(
      children: [
        Expanded(
          child: _buildDeliveryButton(
            'home_delivery', 
            'À domicile', 
            LucideIcons.home
          ),
        ),
        const SizedBox(width: SolenneSpacing.md),
        Expanded(
          child: _buildDeliveryButton(
            'stop_desk', 
            'Stop Desk', 
            LucideIcons.building
          ),
        ),
      ],
    );
  }

  Widget _buildDeliveryButton(String value, String label, IconData icon) {
    final isSelected = _deliveryMethod == value;
    return InkWell(
      onTap: () => setState(() => _deliveryMethod = value),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? SolenneColors.midnight : Colors.transparent,
          border: Border.all(color: isSelected ? SolenneColors.midnight : SolenneColors.line),
          borderRadius: SolenneBorders.borderRadius,
        ),
        child: Column(
          children: [
            Icon(icon, color: isSelected ? SolenneColors.ivory : SolenneColors.midnight, size: 20),
            const SizedBox(height: 8),
            Text(
              label, 
              style: SolenneTypography.body(
                color: isSelected ? SolenneColors.ivory : SolenneColors.midnight,
                fontSize: 12
              )
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, double amount, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label, 
          style: isTotal ? SolenneTypography.productName(fontSize: 15) : SolenneTypography.body(color: SolenneColors.muted)
        ),
        SolennePrice(
          amount: amount, 
          fontSize: isTotal ? 18 : 14,
          color: (label.contains('Livraison') && amount == 0) ? SolenneColors.gold : null,
        ),
      ],
    );
  }
}
