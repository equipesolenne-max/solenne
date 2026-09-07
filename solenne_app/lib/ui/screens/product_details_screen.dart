import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_price.dart';
import '../components/solenne_button.dart';
import '../components/solenne_loading.dart';
import '../../models/product_model.dart';
import '../../services/product_repository.dart';
import '../../state/cart_state.dart';
import '../../state/wishlist_state.dart';
import '../../core/utils/url_utils.dart';

/// Large swipeable gallery, title, price, description, variant/color
/// selection, availability, quantity, "ADD TO BAG" primary CTA, wishlist,
/// shipping info.
class ProductDetailsScreen extends StatefulWidget {
  const ProductDetailsScreen({super.key, required this.productId});

  final String productId;

  @override
  State<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends State<ProductDetailsScreen> {
  int _galleryIndex = 0;
  ProductVariantModel? _selectedVariant;
  int _quantity = 1;

  @override
  Widget build(BuildContext context) {
    final wishlist = context.watch<WishlistState>();
    final cart = context.read<CartState>();

    return Scaffold(
      body: FutureBuilder<ProductModel?>(
        future: context.read<ProductRepository>().getById(widget.productId),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const SolenneLoading();
          final product = snapshot.data;
          if (product == null) {
            return const Center(child: Text('Product not found'));
          }
          _selectedVariant ??= product.variants.isNotEmpty ? product.variants.first : null;

          return CustomScrollView(
            slivers: [
              SliverAppBar(
                backgroundColor: SolenneColors.ivory,
                surfaceTintColor: Colors.transparent,
                pinned: true,
                expandedHeight: 420,
                leading: const BackButton(color: SolenneColors.midnight),
                actions: [
                  IconButton(
                    icon: Icon(
                      LucideIcons.heart,
                      color: wishlist.isWishlisted(product.id) ? SolenneColors.gold : SolenneColors.midnight,
                    ),
                    onPressed: () => wishlist.toggle(product.id),
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: product.images.isEmpty
                      ? Container(color: SolenneColors.ivoryWarm)
                      : PageView.builder(
                          itemCount: product.images.length,
                          onPageChanged: (i) => setState(() => _galleryIndex = i),
                          itemBuilder: (context, i) => UrlUtils.buildImage(product.images[i], fit: BoxFit.cover),
                        ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(SolenneSpacing.pageHorizontal),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (product.images.length > 1)
                        Padding(
                          padding: const EdgeInsets.only(bottom: SolenneSpacing.md),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(product.images.length, (i) {
                              final active = i == _galleryIndex;
                              return Container(
                                margin: const EdgeInsets.symmetric(horizontal: 3),
                                width: 6,
                                height: 6,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: active ? SolenneColors.gold : SolenneColors.line,
                                ),
                              );
                            }),
                          ),
                        ),
                      Text(product.name, style: SolenneTypography.heading(fontSize: 22)),
                      const SizedBox(height: SolenneSpacing.sm),
                      SolennePrice(amount: product.price, compareAtAmount: product.compareAtPrice, fontSize: 17),
                      const SizedBox(height: SolenneSpacing.lg),
                      Text(
                        product.inStock ? 'In stock' : 'Out of stock',
                        style: SolenneTypography.caption(
                          color: product.inStock ? SolenneColors.success : SolenneColors.error,
                        ),
                      ),
                      const SizedBox(height: SolenneSpacing.lg),
                      if (product.variants.isNotEmpty) ...[
                        Text('VARIANT', style: SolenneTypography.label(color: SolenneColors.muted)),
                        const SizedBox(height: SolenneSpacing.sm),
                        Wrap(
                          spacing: SolenneSpacing.sm,
                          children: product.variants.map((v) {
                            final selected = v.id == _selectedVariant?.id;
                            return ChoiceChip(
                              label: Text(v.name),
                              selected: selected,
                              onSelected: (_) => setState(() => _selectedVariant = v),
                              backgroundColor: SolenneColors.ivory,
                              selectedColor: SolenneColors.midnight,
                              labelStyle: SolenneTypography.body(
                                color: selected ? SolenneColors.ivory : SolenneColors.midnight,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: SolenneBorders.borderRadius,
                                side: BorderSide(color: selected ? SolenneColors.midnight : SolenneColors.line),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: SolenneSpacing.lg),
                      ],
                      Text('QUANTITY', style: SolenneTypography.label(color: SolenneColors.muted)),
                      const SizedBox(height: SolenneSpacing.sm),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(LucideIcons.minus, size: 16),
                            onPressed: () => setState(() => _quantity = (_quantity - 1).clamp(1, 99)),
                          ),
                          Text('$_quantity', style: SolenneTypography.body()),
                          IconButton(
                            icon: const Icon(LucideIcons.plus, size: 16),
                            onPressed: () => setState(() => _quantity = (_quantity + 1).clamp(1, 99)),
                          ),
                        ],
                      ),
                      const SizedBox(height: SolenneSpacing.lg),
                      Text(product.description, style: SolenneTypography.editorialBody(color: SolenneColors.muted)),
                      const SizedBox(height: SolenneSpacing.xl),
                      SolenneButton(
                        label: 'Add to Bag',
                        onPressed: product.inStock
                            ? () {
                                cart.add(product, variant: _selectedVariant, quantity: _quantity);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    backgroundColor: SolenneColors.midnight,
                                    content: Text('Added to bag', style: SolenneTypography.body(color: SolenneColors.ivory)),
                                  ),
                                );
                              }
                            : null,
                      ),
                      const SizedBox(height: SolenneSpacing.xxl),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
