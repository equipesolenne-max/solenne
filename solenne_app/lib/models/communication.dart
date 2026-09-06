class ContactMessage {
  final String id;
  final String subject;
  final String message;
  final String status;
  final bool isRead;
  final DateTime createdAt;
  final List<MessageReply> replies;

  ContactMessage({
    required this.id,
    required this.subject,
    required this.message,
    required this.status,
    required this.isRead,
    required this.createdAt,
    required this.replies,
  });

  factory ContactMessage.fromJson(Map<String, dynamic> json) {
    return ContactMessage(
      id: json['id'].toString(),
      subject: json['subject'] ?? '',
      message: json['message'] ?? '',
      status: json['status'] ?? 'new',
      isRead: json['is_read_by_user'] ?? true,
      createdAt: DateTime.parse(json['created_at']),
      replies: (json['replies'] as List?)
              ?.map((r) => MessageReply.fromJson(r))
              .toList() ??
          [],
    );
  }
}

class MessageReply {
  final String id;
  final String text;
  final bool isAdmin;
  final DateTime createdAt;

  MessageReply({
    required this.id,
    required this.text,
    required this.isAdmin,
    required this.createdAt,
  });

  factory MessageReply.fromJson(Map<String, dynamic> json) {
    return MessageReply(
      id: json['id'].toString(),
      text: json['text'] ?? '',
      isAdmin: json['is_admin'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
