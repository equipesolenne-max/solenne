import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/product_model.dart';
import '../../core/utils/url_utils.dart';
import '../screens/product_details_screen.dart';
import 'package:intl/intl.dart';

class ProductCard extends StatelessWidget {
  final ProductModel product;

  const ProductCard({super.key, required this.product});

  String formatPrice(double price) {
    final formatter = NumberFormat("#,###", "fr_DZ");
    return "${formatter.format(price)} DA";
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ProductDetailsScreen(productId: product.id),
          ),
        );
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: SolenneColors.ivoryWarm,
                border: Border.all(color: SolenneColors.line, width: 0.5),
              ),
              child: Stack(
                children: [
                  Positioned.fill(
                    child: product.images.isNotEmpty
                        ? UrlUtils.buildImage(product.images[0], fit: BoxFit.cover)
                        : const Center(
                            child: Icon(Icons.image_outlined,
                                color: SolenneColors.line),
                          ),
                  ),
                  if (product.isNew)
                    Positioned(
                      top: 12,
                      left: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        color: SolenneColors.gold,
                        child: const Text(
                          'NEW',
                          style: TextStyle(
                            color: SolenneColors.ivory,
                            fontSize: 8,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            product.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: SolenneColors.midnight,
              fontSize: 14,
              fontWeight: FontWeight.w400,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            formatPrice(product.price),
            style: TextStyle(
              color: SolenneColors.midnight.withOpacity(0.6),
              fontSize: 13,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}
