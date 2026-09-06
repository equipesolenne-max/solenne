import 'dart:async';
import '../models/notification_model.dart';
import '../core/network/api_client.dart';

class NotificationRepository {
  NotificationRepository(this._apiClient);
  final ApiClient _apiClient;

  Stream<List<NotificationModel>> watchMyNotifications() {
    return Stream.fromFuture(getMyNotifications());
  }

  Future<List<NotificationModel>> getMyNotifications() async {
    final response = await _apiClient.dio.get('/notifications/');
    final List data = response.data;
    return data.map((item) => NotificationModel.fromMap(item['id'].toString(), item)).toList();
  }

  Future<void> markRead(String notificationId) async {
    await _apiClient.dio.post('/notifications/$notificationId/read/');
  }

  Future<void> markAllAsRead() async {
    await _apiClient.dio.post('/notifications/read_all/');
  }
}
