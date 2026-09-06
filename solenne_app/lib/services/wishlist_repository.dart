import '../core/network/api_client.dart';

class WishlistRepository {
  WishlistRepository(this._apiClient);
  final ApiClient _apiClient;

  ApiClient get apiClient => _apiClient;

  Future<List<String>> getWishlist() async {
    final response = await _apiClient.dio.get('/wishlist/');
    final List ids = response.data['product_ids'];
    return ids.map((e) => e.toString()).toList();
  }

  Future<List<String>> updateWishlist(List<String> productIds) async {
    final response = await _apiClient.dio.put('/wishlist/', data: {
      'product_ids': productIds.map((e) => int.parse(e)).toList(),
    });
    final List ids = response.data['product_ids'];
    return ids.map((e) => e.toString()).toList();
  }
}
