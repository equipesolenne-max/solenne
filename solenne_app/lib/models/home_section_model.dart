import 'product_model.dart';
import 'category_model.dart';
import 'collection_model.dart';

class HomeSectionModel {
  final String id;
  final String sectionType;
  final String title;
  final String subtitle;
  final String description;
  final String? mediaUrl;
  final String? link;
  final String? buttonText;
  final List<ProductModel> products;
  final List<CategoryModel> categories;
  final List<String> gallery;
  final CollectionModel? collection;
  final int position;

  HomeSectionModel({
    required this.id,
    required this.sectionType,
    required this.title,
    this.subtitle = '',
    this.description = '',
    this.mediaUrl,
    this.link,
    this.buttonText,
    this.products = const [],
    this.categories = const [],
    this.gallery = const [],
    this.collection,
    required this.position,
  });

  factory HomeSectionModel.fromMap(Map<String, dynamic> map) {
    return HomeSectionModel(
      id: map['id'].toString(),
      sectionType: map['section_type'],
      title: map['title'] ?? '',
      subtitle: map['subtitle'] ?? '',
      description: map['description'] ?? '',
      mediaUrl: map['media_url'],
      link: map['link'],
      buttonText: map['button_text'],
      products: (map['products'] as List? ?? [])
          .map((p) => ProductModel.fromMap(p['id'].toString(), p))
          .toList(),
      categories: (map['categories'] as List? ?? [])
          .map((c) => CategoryModel.fromMap(c))
          .toList(),
      gallery: (map['gallery'] as List? ?? [])
          .map((g) => g['url'].toString())
          .toList(),
      collection: map['collection_detail'] != null 
          ? CollectionModel.fromMap(map['collection_detail']) 
          : null,
      position: map['position'] ?? 0,
    );
  }
}
