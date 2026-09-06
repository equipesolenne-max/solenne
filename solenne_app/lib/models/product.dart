class Product {
  final String id;
  final String? legacyId;
  final String name;
  final int price;
  final String description;
  final String? collection;
  final String? collectionId;
  final String? category;
  final List<String> images;
  final List<ProductVariant> colors;
  final bool isNew;
  final bool inStock;

  Product({
    required this.id,
    this.legacyId,
    required this.name,
    required this.price,
    required this.description,
    this.collection,
    this.collectionId,
    this.category,
    required this.images,
    required this.colors,
    required this.isNew,
    required this.inStock,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'].toString(),
      legacyId: json['legacy_id']?.toString(),
      name: json['name'] ?? '',
      price: (json['price'] as num?)?.toInt() ?? 0,
      description: json['description'] ?? '',
      collection: json['collection'],
      collectionId: json['collection_id']?.toString(),
      category: json['category'],
      images: List<String>.from(json['images'] ?? []),
      colors: (json['variants'] as List?)
              ?.map((v) => ProductVariant.fromJson(v))
              .toList() ??
          [],
      isNew: json['is_new'] ?? false,
      inStock: json['in_stock'] ?? true,
    );
  }
}

class ProductVariant {
  final String name;
  final String hex;
  final String? image;
  final List<String> images;
  final int stock;

  ProductVariant({
    required this.name,
    required this.hex,
    this.image,
    required this.images,
    required this.stock,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    return ProductVariant(
      name: json['name'] ?? '',
      hex: json['hex'] ?? '#C6A369',
      image: json['image'],
      images: List<String>.from(json['images'] ?? []),
      stock: json['stock'] ?? 0,
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
