import 'dart:async';
import '../models/product_model.dart';
import '../models/category_model.dart';
import '../models/collection_model.dart';
import '../core/network/api_client.dart';

class ProductRepository {
  ProductRepository(this._apiClient);
  final ApiClient _apiClient;

  Stream<List<ProductModel>> watchAll({
    String? category,
    String? collection,
    double? minPrice,
    double? maxPrice,
    String? sort,
  }) {
    // Convert Future to Stream to maintain compatibility with existing StreamBuilder UI
    return Stream.fromFuture(getAll(
      category: category,
      collection: collection,
      minPrice: minPrice,
      maxPrice: maxPrice,
      sort: sort,
    ));
  }

  Future<List<ProductModel>> getAll({
    String? category,
    String? collection,
    double? minPrice,
    double? maxPrice,
    String? sort,
  }) async {
    final response = await _apiClient.dio.get('/products/', queryParameters: {
      if (category != null) 'category': category,
      if (collection != null) 'collection': collection,
      if (minPrice != null) 'min_price': minPrice,
      if (maxPrice != null) 'max_price': maxPrice,
      if (sort != null) 'sort': sort,
    });

    final List data = response.data;
    return data.map((item) => ProductModel.fromMap(item['id'].toString(), item)).toList();
  }

  Future<List<CategoryModel>> getCategories() async {
    try {
      final response = await _apiClient.dio.get('/categories/');
      final List data = response.data;
      return data.map((item) => CategoryModel.fromMap(item)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<List<CollectionModel>> getCollections() async {
    try {
      final response = await _apiClient.dio.get('/collections/');
      final List data = response.data;
      return data.map((item) => CollectionModel.fromMap(item)).toList();
    } catch (e) {
      return [];
    }
  }

  Stream<List<ProductModel>> watchNewArrivals({int limit = 10}) {
    return Stream.fromFuture(getNewArrivals(limit: limit));
  }

  Future<List<ProductModel>> getNewArrivals({int limit = 10}) async {
    final response = await _apiClient.dio.get('/products/', queryParameters: {
      'is_new': true,
      'limit': limit,
    });
    final List data = response.data;
    return data.map((item) => ProductModel.fromMap(item['id'].toString(), item)).toList();
  }

  Future<ProductModel?> getById(String id) async {
    try {
      final response = await _apiClient.dio.get('/products/$id/');
      return ProductModel.fromMap(id, response.data);
    } catch (e) {
      return null;
    }
  }

  Future<List<ProductModel>> search(String query) async {
    final response = await _apiClient.dio.get('/products/', queryParameters: {'q': query});
    final List data = response.data;
    return data.map((item) => ProductModel.fromMap(item['id'].toString(), item)).toList();
  }
}
