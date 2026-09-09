import '../core/utils/url_utils.dart';

class CategoryModel {
  const CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description = '',
    this.image,
  });

  final int id;
  final String name;
  final String slug;
  final String description;
  final String? image;

  factory CategoryModel.fromMap(Map<String, dynamic> map) {
    return CategoryModel(
      id: map['id'] as int? ?? 0,
      name: map['name'] as String? ?? '',
      slug: map['slug'] as String? ?? '',
      description: map['description'] as String? ?? '',
      image: map['image'] != null ? UrlUtils.sanitizeUrl(map['image'] as String) : null,
    );
  }
}
