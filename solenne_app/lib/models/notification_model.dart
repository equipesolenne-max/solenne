/// Notification model mapping Django notification data.
class NotificationModel {
  const NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.createdAt,
    this.read = false,
    this.url = '',
  });

  final String id;
  final String title;
  final String message;
  final DateTime createdAt;
  final bool read;
  final String url;

  factory NotificationModel.fromMap(String id, Map<String, dynamic> map) {
    return NotificationModel(
      id: id,
      title: map['title'] as String? ?? '',
      message: map['message'] as String? ?? '',
      createdAt: DateTime.tryParse(map['created_at'] as String? ?? '') ?? DateTime.now(),
      read: map['is_read'] as bool? ?? false,
      url: map['url'] as String? ?? '',
    );
  }
}
