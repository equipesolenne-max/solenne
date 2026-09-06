import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../services/inquiry_repository.dart';
import '../../models/communication.dart';

class InquiryChatScreen extends StatefulWidget {
  final ContactMessage message;

  const InquiryChatScreen({super.key, required this.message});

  @override
  State<InquiryChatScreen> createState() => _InquiryChatScreenState();
}

class _InquiryChatScreenState extends State<InquiryChatScreen> {
  final TextEditingController _replyController = TextEditingController();
  late List<MessageReply> _replies;
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    _replies = List.from(widget.message.replies);
  }

  Future<void> _sendReply() async {
    if (_replyController.text.trim().isEmpty) return;

    setState(() => _isSending = true);
    try {
      await context.read<InquiryRepository>().sendReply(widget.message.id, _replyController.text);
      
      // Update local state (optimistic or refresh)
      setState(() {
        _replies.add(MessageReply(
          id: DateTime.now().toString(),
          text: _replyController.text,
          isAdmin: false,
          createdAt: DateTime.now(),
        ));
        _replyController.clear();
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to send reply. Please try again.')),
      );
    } finally {
      setState(() => _isSending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          children: [
            Text(widget.message.subject.toUpperCase(), style: const TextStyle(fontSize: 12)),
            Text(
              'INQUIRY #${widget.message.id.substring(0, 8)}',
              style: TextStyle(fontSize: 8, color: SolenneColors.midnight.withOpacity(0.4)),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // Initial Message
                _buildChatBubble(widget.message.message, widget.message.createdAt, false, isInitial: true),
                
                // Replies
                ..._replies.map((r) => _buildChatBubble(r.text, r.createdAt, r.isAdmin)),
              ],
            ),
          ),
          
          // Reply Input
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildChatBubble(String text, DateTime time, bool isAdmin, {bool isInitial = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: isAdmin ? CrossAxisAlignment.start : CrossAxisAlignment.end,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
            decoration: BoxDecoration(
              color: isAdmin ? SolenneColors.midnight : Colors.white,
              border: isAdmin ? null : Border.all(color: SolenneColors.line),
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(20),
                topRight: const Radius.circular(20),
                bottomLeft: Radius.circular(isAdmin ? 0 : 20),
                bottomRight: Radius.circular(isAdmin ? 20 : 0),
              ),
            ),
            child: Text(
              text,
              style: TextStyle(
                fontSize: 14,
                color: isAdmin ? SolenneColors.ivory : SolenneColors.midnight,
                height: 1.5,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${isAdmin ? 'SOLENNE ATELIER' : 'YOU'} · ${time.hour}:${time.minute.toString().padLeft(2, '0')}',
            style: const TextStyle(fontSize: 9, letterSpacing: 1, color: SolenneColors.line),
          ),
        ],
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(context).padding.bottom + 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: SolenneColors.line)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _replyController,
              decoration: InputDecoration(
                hintText: 'Type your message...',
                hintStyle: TextStyle(fontSize: 14, color: SolenneColors.midnight.withOpacity(0.3)),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: const BorderSide(color: SolenneColors.line),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              ),
              maxLines: null,
            ),
          ),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: _isSending ? null : _sendReply,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: SolenneColors.midnight,
                shape: BoxShape.circle,
              ),
              child: _isSending
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.send, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}
