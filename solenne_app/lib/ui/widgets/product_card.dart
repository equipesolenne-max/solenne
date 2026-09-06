import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/product.dart';
import '../screens/product_detail_screen.dart';
import 'package:intl/intl.dart';

class ProductCard extends StatelessWidget {
  final Product product;

  const ProductCard({super.key, required this.product});

  String formatPrice(int price) {
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
            builder: (context) => ProductDetailScreen(product: product),
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
                        ? Image.network(
                            product.images[0],
                            fit: BoxFit.cover,
                          )
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
                  Positioned(
                    top: 8,
                    right: 8,
                    child: IconButton(
                      icon: const Icon(Icons.favorite_border,
                          size: 20, color: SolenneColors.midnight),
                      onPressed: () {},
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
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  letterSpacing: 0.5,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            formatPrice(product.price),
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
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
