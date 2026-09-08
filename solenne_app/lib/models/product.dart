class Product {
  final String id;
  final String? legacyId;
  final String name;
  final int price;
  final int? compareAtPrice;
  final String description;
  final String? material;
  final String? dimensions;
  final String? collection;
  final String? collectionId;
  final String? category;
  final List<String> images;
  final List<ProductVariant> variants;
  final bool isNew;
  final bool inStock;

  Product({
    required this.id,
    this.legacyId,
    required this.name,
    required this.price,
    this.compareAtPrice,
    required this.description,
    this.material,
    this.dimensions,
    this.collection,
    this.collectionId,
    this.category,
    required this.images,
    required this.variants,
    required this.isNew,
    required this.inStock,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'].toString(),
      legacyId: json['legacy_id']?.toString(),
      name: json['name'] ?? '',
      price: (json['price'] as num?)?.toInt() ?? 0,
      compareAtPrice: (json['compare_at_price'] as num?)?.toInt(),
      description: json['description'] ?? '',
      material: json['material'],
      dimensions: json['dimensions'],
      collection: json['collection'],
      collectionId: json['collection_id']?.toString(),
      category: json['category'],
      images: List<String>.from(json['images'] ?? []),
      variants: (json['variants'] as List?)
              ?.map((v) => ProductVariant.fromJson(v))
              .toList() ??
          [],
      isNew: json['is_new'] ?? false,
      inStock: json['active'] ?? true, // Backend uses 'active' for overall status
    );
  }

  List<String> get colors => variants.map((v) => v.name).toSet().toList();
}

class ProductVariant {
  final int id;
  final String name;
  final String? size;
  final String hex;
  final int? price;
  final int? compareAtPrice;
  final String? image;
  final List<String> images;
  final int stock;
  final String sku;

  ProductVariant({
    required this.id,
    required this.name,
    this.size,
    required this.hex,
    this.price,
    this.compareAtPrice,
    this.image,
    required this.images,
    required this.stock,
    this.sku = '',
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    return ProductVariant(
      id: json['id'] as int? ?? 0,
      name: json['name'] ?? '',
      size: json['size'],
      hex: json['hex'] ?? '#C6A369',
      price: (json['price'] as num?)?.toInt(),
      compareAtPrice: (json['compare_at_price'] as num?)?.toInt(),
      image: json['image'],
      images: List<String>.from(json['images'] ?? []),
      stock: json['stock'] ?? 0,
      sku: json['sku'] ?? '',
    );
  }
}

class Collection {
  final String id;
  final String name;
  final String? tagline;
  final String? image;

  Collection({
    required this.id,
    required this.name,
    this.tagline,
    this.image,
  });

  factory Collection.fromJson(Map<String, dynamic> json) {
    return Collection(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      tagline: json['description'],
      image: json['image'],
    );
  }
}
