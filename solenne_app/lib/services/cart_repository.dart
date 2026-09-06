import '../core/network/api_client.dart';
import '../models/product_model.dart';

class CartRepository {
  CartRepository(this._apiClient);
  final ApiClient _apiClient;

  ApiClient get apiClient => _apiClient;

  Future<Map<String, dynamic>> getCart() async {
    final response = await _apiClient.dio.get('/cart/');
    return response.data;
  }

  Future<void> addItem(String productId, int? variantId, int quantity) async {
    await _apiClient.dio.post('/cart/items/', data: {
      'product_id': productId,
      if (variantId != null) 'variant_id': variantId,
      'quantity': quantity,
    });
  }

  Future<void> updateItem(int itemId, int quantity) async {
    await _apiClient.dio.patch('/cart/items/$itemId/', data: {
      'quantity': quantity,
    });
  }

  Future<void> removeItem(int itemId) async {
    await _apiClient.dio.delete('/cart/items/$itemId/');
  }
}
