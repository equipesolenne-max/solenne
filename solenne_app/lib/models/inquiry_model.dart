/// Inquiry (conversation) model.
///
/// This MUST read/write the same Firestore conversation data the web admin
/// dashboard uses — verify collection/field names against the admin app
/// before wiring InquiryRepository. Do not create a parallel schema.
class InquiryMessage {
  const InquiryMessage({
    required this.id,
    required this.senderId,
    required this.senderIsAdmin,
    required this.text,
    required this.sentAt,
  });

  final String id;
  final String senderId;
  final bool senderIsAdmin;
  final String text;
  final DateTime sentAt;

  factory InquiryMessage.fromMap(String id, Map<String, dynamic> map) => InquiryMessage(
        id: id,
        senderId: map['senderId'] as String? ?? '',
        senderIsAdmin: map['senderIsAdmin'] as bool? ?? false,
        text: map['text'] as String? ?? '',
        sentAt: DateTime.tryParse(map['sentAt'] as String? ?? '') ?? DateTime.now(),
      );

  Map<String, dynamic> toMap() => {
        'senderId': senderId,
        'senderIsAdmin': senderIsAdmin,
        'text': text,
        'sentAt': sentAt.toIso8601String(),
      };
}

class InquiryThread {
  const InquiryThread({
    required this.id,
    required this.customerId,
    required this.subject,
    required this.lastMessage,
    required this.lastMessageAt,
    this.unreadForCustomer = false,
  });

  final String id;
  final String customerId;
  final String subject;
  final String lastMessage;
  final DateTime lastMessageAt;
  final bool unreadForCustomer;

  factory InquiryThread.fromMap(String id, Map<String, dynamic> map) => InquiryThread(
        id: id,
        customerId: map['customerId'] as String? ?? '',
        subject: map['subject'] as String? ?? '',
        lastMessage: map['lastMessage'] as String? ?? '',
        lastMessageAt:
            DateTime.tryParse(map['lastMessageAt'] as String? ?? '') ?? DateTime.now(),
        unreadForCustomer: map['unreadForCustomer'] as bool? ?? false,
      );
}
