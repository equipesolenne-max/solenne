import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../services/inquiry_repository.dart';
import '../../models/communication.dart';
import 'inquiry_chat_screen.dart';

class InquiryListScreen extends StatefulWidget {
  const InquiryListScreen({super.key});

  @override
  State<InquiryListScreen> createState() => _InquiryListScreenState();
}

class _InquiryListScreenState extends State<InquiryListScreen> {
  late Future<List<ContactMessage>> _messagesFuture;

  @override
  void initState() {
    super.initState();
    _messagesFuture = context.read<InquiryRepository>().getMyInquiries();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('MY INQUIRIES'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: SolenneColors.midnight),
            onPressed: () {
              // Show new inquiry dialog or screen
            },
          ),
        ],
      ),
      body: FutureBuilder<List<ContactMessage>>(
        future: _messagesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(strokeWidth: 2));
          }
          if (snapshot.hasError) {
            return Center(
              child: Text(
                'No inquiries found.',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontSize: 16),
              ),
            );
          }
          
          final messages = snapshot.data ?? [];
          if (messages.isEmpty) {
            return const Center(
              child: Text('You have no active inquiries.'),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(20),
            itemCount: messages.length,
            separatorBuilder: (context, index) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final msg = messages[index];
              return _buildMessageCard(msg);
            },
          );
        },
      ),
    );
  }

  Widget _buildMessageCard(ContactMessage msg) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => InquiryChatScreen(message: msg)),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: SolenneColors.line),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getStatusColor(msg.status).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    msg.status.toUpperCase(),
                    style: TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                      color: _getStatusColor(msg.status),
                    ),
                  ),
                ),
                Text(
                  '${msg.createdAt.day}/${msg.createdAt.month}/${msg.createdAt.year}',
                  style: const TextStyle(fontSize: 10, color: SolenneColors.line),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              msg.subject,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              msg.message,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 12,
                color: SolenneColors.midnight.withOpacity(0.5),
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'new': return Colors.amber.shade700;
      case 'replied': return Colors.green.shade700;
      case 'resolved': return Colors.grey;
      default: return SolenneColors.midnight;
    }
  }
}
