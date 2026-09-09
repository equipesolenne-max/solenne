import '../core/network/api_client.dart';
import '../models/shipping_rate_model.dart';

class ShippingRepository {
  final ApiClient apiClient;

  ShippingRepository(this.apiClient);

  Future<List<ShippingRateModel>> getRates() async {
    try {
      final response = await apiClient.dio.get('/shipping/rates/');
      final List data = response.data;
      return data.map((item) => ShippingRateModel.fromJson(item)).toList();
    } catch (e) {
      return [];
    }
  }
}
