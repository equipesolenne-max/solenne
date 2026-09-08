import 'package:flutter/material.dart';
import '../../models/product.dart';
import 'product_details_screen.dart';

/// Legacy wrapper for ProductDetailsScreen.
class ProductDetailScreen extends StatelessWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return ProductDetailsScreen(productId: product.id);
  }
}
