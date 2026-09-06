import 'dart:async';
import '../core/network/api_client.dart';
import '../models/communication.dart';
import '../models/inquiry_model.dart';

class InquiryRepository {
  InquiryRepository(this._apiClient);
  final ApiClient _apiClient;

  Stream<List<InquiryThread>> watchMyThreads(String customerId) {
    return Stream.fromFuture(getMyThreads(customerId));
  }

  Future<List<InquiryThread>> getMyThreads(String customerId) async {
    final response = await _apiClient.dio.get('/contact-messages/');
    final List data = response.data;
    return data.map((item) {
      final msg = ContactMessage.fromJson(item);
      return InquiryThread(
        id: msg.id,
        customerId: customerId,
        subject: msg.subject,
        lastMessage: msg.replies.isNotEmpty ? msg.replies.last.text : msg.message,
        lastMessageAt: msg.replies.isNotEmpty ? msg.replies.last.createdAt : msg.createdAt,
        unreadForCustomer: !msg.isRead,
      );
    }).toList();
  }

  Stream<List<InquiryMessage>> watchMessages(String threadId) {
    return Stream.fromFuture(getMessages(threadId));
  }

  Future<List<InquiryMessage>> getMessages(String threadId) async {
    final response = await _apiClient.dio.get('/contact-messages/$threadId/');
    final msg = ContactMessage.fromJson(response.data);
    final List<InquiryMessage> result = [];
    
    // Initial message
    result.add(InquiryMessage(
      id: 'initial',
      senderId: '',
      senderIsAdmin: false,
      text: msg.message,
      sentAt: msg.createdAt,
    ));
    
    // Replies
    for (var r in msg.replies) {
      result.add(InquiryMessage(
        id: r.id,
        senderId: '',
        senderIsAdmin: r.isAdmin,
        text: r.text,
        sentAt: r.createdAt,
      ));
    }
    
    return result;
  }

  Future<String> createThread({
    required String name,
    required String email,
    required String subject,
    required String firstMessage,
  }) async {
    final response = await _apiClient.dio.post('/contact/', data: {
      'name': name,
      'email': email,
      'subject': subject,
      'message': firstMessage,
    });
    return response.data['id']?.toString() ?? '';
  }

  Future<void> sendMessage(String threadId, InquiryMessage message) async {
    await _apiClient.dio.post('/contact-messages/$threadId/reply/', data: {
      'text': message.text,
    });
  }

  // Backward compatibility for InquiryListScreen / InquiryChatScreen
  Future<List<ContactMessage>> getMyInquiries() async {
    final response = await _apiClient.dio.get('/contact-messages/');
    final List data = response.data;
    return data.map((item) => ContactMessage.fromJson(item)).toList();
  }

  Future<void> sendReply(String threadId, String text) async {
    await _apiClient.dio.post('/contact-messages/$threadId/reply/', data: {
      'text': text,
    });
  }
}
