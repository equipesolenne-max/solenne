import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_product_card.dart';
import '../components/solenne_empty_state.dart';
import '../components/solenne_loading.dart';
import '../../models/product_model.dart';
import '../../services/product_repository.dart';
import '../../state/wishlist_state.dart';
import 'product_details_screen.dart';
import 'root_shell.dart';

class WishlistScreen extends StatelessWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final wishlist = context.watch<WishlistState>();

    return Scaffold(
      appBar: AppBar(title: Text('WISHLIST', style: SolenneTypography.sectionTitle())),
      body: wishlist.productIds.isEmpty
          ? SolenneEmptyState(
              title: 'Nothing saved yet',
              message: 'Tap the heart on any piece to save it here.',
              icon: LucideIcons.heart,
              actionLabel: 'Browse shop',
              onAction: () => Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const RootShell()),
              ),
            )
          : StreamBuilder<List<ProductModel>>(
              stream: context.read<ProductRepository>().watchAll(),
              builder: (context, snapshot) {
                if (!snapshot.hasData) return const SolenneLoading();
                final products = snapshot.data!
                    .where((p) => wishlist.isWishlisted(p.id))
                    .toList();
                return GridView.builder(
                  padding: const EdgeInsets.all(SolenneSpacing.pageHorizontal),
                  itemCount: products.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: SolenneSpacing.lg,
                    crossAxisSpacing: SolenneSpacing.md,
                    childAspectRatio: 0.62,
                  ),
                  itemBuilder: (context, i) => SolenneProductCard(
                    product: products[i],
                    isWishlisted: true,
                    onWishlistTap: () => wishlist.toggle(products[i].id),
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => ProductDetailsScreen(productId: products[i].id)),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
