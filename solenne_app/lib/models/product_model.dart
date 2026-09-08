import '../core/utils/url_utils.dart';

/// Product model mapping Django product data.
class ProductModel {
  const ProductModel({
    required this.id,
    required this.name,
    required this.price,
    this.compareAtPrice,
    required this.images,
    this.description = '',
    this.material = '',
    this.dimensions = '',
    this.category = '',
    this.collection = '',
    this.variants = const [],
    this.inStock = true,
    this.isNew = false,
  });

  final String id;
  final String name;
  final double price;
  final double? compareAtPrice;
  final List<String> images;
  final String description;
  final String material;
  final String dimensions;
  final String category;
  final String collection;
  final List<ProductVariantModel> variants;
  final bool inStock;
  final bool isNew;

  factory ProductModel.fromMap(String id, Map<String, dynamic> map) {
    return ProductModel(
      id: id,
      name: map['name'] as String? ?? '',
      price: (map['price'] as num?)?.toDouble() ?? 0,
      compareAtPrice: (map['compare_at_price'] as num?)?.toDouble(),
      images: UrlUtils.sanitizeUrls(List<String>.from(map['images'] as List? ?? const [])),
      description: map['description'] as String? ?? '',
      material: map['material'] as String? ?? '',
      dimensions: map['dimensions'] as String? ?? '',
      category: map['category'] as String? ?? '',
      collection: map['collection'] as String? ?? '',
      variants: (map['variants'] as List? ?? const [])
          .map((v) => ProductVariantModel.fromMap(v as Map<String, dynamic>))
          .toList(),
      inStock: map['active'] as bool? ?? true,
      isNew: map['is_new'] as bool? ?? false,
    );
  }
}

class ProductVariantModel {
  const ProductVariantModel({
    required this.id,
    required this.name,
    this.size,
    required this.hex,
    this.price,
    this.compareAtPrice,
    required this.stock,
    this.images = const [],
    this.sku = '',
  });

  final int id;
  final String name;
  final String? size;
  final String hex;
  final double? price;
  final double? compareAtPrice;
  final int stock;
  final List<String> images;
  final String sku;

  factory ProductVariantModel.fromMap(Map<String, dynamic> map) {
    return ProductVariantModel(
      id: map['id'] as int? ?? 0,
      name: map['name'] as String? ?? '',
      size: map['size'] as String?,
      hex: map['hex'] as String? ?? '#C6A369',
      price: (map['price'] as num?)?.toDouble(),
      compareAtPrice: (map['compare_at_price'] as num?)?.toDouble(),
      stock: map['stock'] as int? ?? 0,
      images: UrlUtils.sanitizeUrls(List<String>.from(map['images'] as List? ?? const [])),
      sku: map['sku'] as String? ?? '',
    );
  }
}
