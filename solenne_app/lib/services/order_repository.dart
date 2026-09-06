import 'dart:async';
import '../models/order_model.dart';
import '../core/network/api_client.dart';

class OrderRepository {
  OrderRepository(this._apiClient);
  final ApiClient _apiClient;

  Stream<List<OrderModel>> watchMyOrders() {
    return Stream.fromFuture(getMyOrders());
  }

  Future<List<OrderModel>> getMyOrders() async {
    final response = await _apiClient.dio.get('/orders/');
    final List data = response.data;
    return data.map((item) => OrderModel.fromMap(item['id'].toString(), item)).toList();
  }

  Stream<OrderModel?> watchOrder(String orderId) {
    return Stream.fromFuture(getOrder(orderId));
  }

  Future<OrderModel?> getOrder(String orderId) async {
    try {
      final response = await _apiClient.dio.get('/orders/$orderId/');
      return OrderModel.fromMap(orderId, response.data);
    } catch (e) {
      return null;
    }
  }

  Future<OrderModel> createOrder(Map<String, dynamic> orderData) async {
    final response = await _apiClient.dio.post('/orders/', data: orderData);
    return OrderModel.fromMap(response.data['id'].toString(), response.data);
  }
}
