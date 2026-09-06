import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_button.dart';
import '../components/solenne_price.dart';
import '../components/solenne_empty_state.dart';
import '../components/solenne_loading.dart';
import '../../state/cart_state.dart';
import 'checkout_screen.dart';
import 'root_shell.dart';

/// Image, name, variant, quantity, price, remove, subtotal/shipping/total,
/// spacious layout, visible checkout CTA.
class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  // Placeholder flat shipping rate — reuse the existing website's actual
  // Wilaya-based shipping calculation instead of a flat rate.
  static const double _shipping = 400;

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartState>();

    return Scaffold(
      appBar: AppBar(title: Text('BAG', style: SolenneTypography.sectionTitle())),
      body: cart.isLoading && cart.lines.isEmpty
          ? const Center(child: SolenneLoading())
          : cart.lines.isEmpty
              ? SolenneEmptyState(
                  title: 'Your bag is empty',
                  message: 'Pieces you add will appear here.',
                  icon: LucideIcons.shoppingBag,
                  actionLabel: 'Continue shopping',
                  onAction: () => Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (_) => const RootShell()),
                  ),
                )
              : Column(
                  children: [
                    Expanded(
                      child: RefreshIndicator(
                        onRefresh: cart.fetchCart,
                        color: SolenneColors.midnight,
                        child: ListView.separated(
                          padding: const EdgeInsets.all(SolenneSpacing.pageHorizontal),
                          physics: const AlwaysScrollableScrollPhysics(),
                          itemCount: cart.lines.length,
                          separatorBuilder: (_, __) => const Divider(height: SolenneSpacing.xl),
                          itemBuilder: (context, i) {
                            final line = cart.lines[i];
                            return Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 72,
                                  height: 96,
                                  decoration: BoxDecoration(
                                    color: SolenneColors.ivoryWarm,
                                    border: Border.all(color: SolenneColors.line),
                                  ),
                                  child: line.product.images.isNotEmpty
                                      ? Image.network(line.product.images.first, fit: BoxFit.cover)
                                      : null,
                                ),
                                const SizedBox(width: SolenneSpacing.md),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(line.product.name, style: SolenneTypography.productName(fontSize: 15)),
                                      if (line.variantName.isNotEmpty)
                                        Text(line.variantName, style: SolenneTypography.caption()),
                                      const SizedBox(height: SolenneSpacing.sm),
                                      SolennePrice(amount: line.lineTotal, fontSize: 14),
                                      const SizedBox(height: SolenneSpacing.sm),
                                      Row(
                                        children: [
                                          IconButton(
                                            padding: EdgeInsets.zero,
                                            constraints: const BoxConstraints(),
                                            icon: const Icon(LucideIcons.minus, size: 14),
                                            onPressed: () => cart.updateQuantity(line.key, line.quantity - 1),
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.symmetric(horizontal: SolenneSpacing.sm),
                                            child: Text('${line.quantity}', style: SolenneTypography.body()),
                                          ),
                                          IconButton(
                                            padding: EdgeInsets.zero,
                                            constraints: const BoxConstraints(),
                                            icon: const Icon(LucideIcons.plus, size: 14),
                                            onPressed: () => cart.updateQuantity(line.key, line.quantity + 1),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(LucideIcons.trash2, size: 16, color: SolenneColors.muted),
                                  onPressed: () => cart.remove(line.key),
                                ),
                              ],
                            );
                          },
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(SolenneSpacing.pageHorizontal),
                      decoration: const BoxDecoration(
                        border: Border(top: BorderSide(color: SolenneColors.line)),
                      ),
                      child: SafeArea(
                        top: false,
                        child: Column(
                          children: [
                            _summaryRow('Subtotal', cart.subtotal),
                            _summaryRow('Shipping', _shipping),
                            const Divider(height: SolenneSpacing.lg),
                            _summaryRow('Total', cart.subtotal + _shipping, emphasize: true),
                            const SizedBox(height: SolenneSpacing.lg),
                            SolenneButton(
                              label: 'Checkout',
                              onPressed: () => Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const CheckoutScreen()),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _summaryRow(String label, double amount, {bool emphasize = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: emphasize ? SolenneTypography.productName(fontSize: 15) : SolenneTypography.body(color: SolenneColors.muted)),
          SolennePrice(amount: amount, fontSize: emphasize ? 16 : 14),
        ],
      ),
    );
  }
}
