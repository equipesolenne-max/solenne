import 'package:flutter/foundation.dart';
import '../models/notification_model.dart';
import '../services/notification_repository.dart';
import 'auth_state.dart';

class NotificationState extends ChangeNotifier {
  NotificationState(this._repository, AuthState authState) {
    if (authState.isSignedIn) {
      fetchNotifications();
    }
    authState.addListener(() {
      if (authState.isSignedIn) {
        fetchNotifications();
      } else {
        _notifications.clear();
        notifyListeners();
      }
    });
  }

  final NotificationRepository _repository;
  final List<NotificationModel> _notifications = [];
  bool _isLoading = false;

  List<NotificationModel> get notifications => List.unmodifiable(_notifications);
  int get unreadCount => _notifications.where((n) => !n.read).length;
  bool get isLoading => _isLoading;

  Future<void> fetchNotifications() async {
    _isLoading = true;
    notifyListeners();
    try {
      final items = await _repository.getMyNotifications();
      _notifications.clear();
      _notifications.addAll(items);
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      await _repository.markRead(id);
      final index = _notifications.indexWhere((n) => n.id == id);
      if (index != -1) {
        _notifications[index] = NotificationModel(
          id: _notifications[index].id,
          title: _notifications[index].title,
          message: _notifications[index].message,
          createdAt: _notifications[index].createdAt,
          read: true,
          url: _notifications[index].url,
        );
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error marking notification as read: $e');
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _repository.markAllAsRead();
      for (int i = 0; i < _notifications.length; i++) {
        _notifications[i] = NotificationModel(
          id: _notifications[i].id,
          title: _notifications[i].title,
          message: _notifications[i].message,
          createdAt: _notifications[i].createdAt,
          read: true,
          url: _notifications[i].url,
        );
      }
      notifyListeners();
    } catch (e) {
      debugPrint('Error marking all notifications as read: $e');
    }
  }
}
