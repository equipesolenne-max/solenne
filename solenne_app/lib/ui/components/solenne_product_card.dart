import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/solenne_theme.dart';
import '../../core/utils/url_utils.dart';
import 'solenne_price.dart';

/// Image-first product card on an ivory/neutral ground — no colored rounded
/// container, no button clutter. Used in the 2-column shop/home grids.
class SolenneProductCard extends StatelessWidget {
  const SolenneProductCard({
    super.key,
    required this.product,
    this.onTap,
    this.onWishlistTap,
    this.isWishlisted = false,
  });

  final ProductModel product;
  final VoidCallback? onTap;
  final VoidCallback? onWishlistTap;
  final bool isWishlisted;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 3 / 4,
            child: Stack(
              children: [
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      color: SolenneColors.ivoryWarm,
                      border: Border.all(color: SolenneColors.line),
                    ),
                    child: product.images.isNotEmpty
                        ? UrlUtils.buildImage(product.images.first, fit: BoxFit.cover)
                        : const Icon(LucideIcons.image, color: SolenneColors.muted),
                  ),
                ),
                if (product.isNew)
                  Positioned(
                    top: SolenneSpacing.sm,
                    left: SolenneSpacing.sm,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      color: SolenneColors.midnight,
                      child: Text('NEW', style: SolenneTypography.eyebrow(color: SolenneColors.goldSoft).copyWith(fontSize: 9)),
                    ),
                  ),
                Positioned(
                  top: SolenneSpacing.sm,
                  right: SolenneSpacing.sm,
                  child: GestureDetector(
                    onTap: onWishlistTap,
                    child: Icon(
                      isWishlisted ? LucideIcons.heart : LucideIcons.heart,
                      size: 18,
                      color: isWishlisted ? SolenneColors.gold : SolenneColors.midnight,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: SolenneSpacing.sm),
          Text(
            product.name,
            style: SolenneTypography.productName(fontSize: 14),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          SolennePrice(amount: product.price, compareAtAmount: product.compareAtPrice, fontSize: 13),
        ],
      ),
    );
  }
}
