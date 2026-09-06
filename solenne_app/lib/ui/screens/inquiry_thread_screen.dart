import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_loading.dart';
import '../../models/inquiry_model.dart';
import '../../services/inquiry_repository.dart';
import '../../state/auth_state.dart';

/// Redesigned Inquiry Thread: elegant chat interface with editorial typography
/// and refined message bubbles.
class InquiryThreadScreen extends StatefulWidget {
  const InquiryThreadScreen({super.key, required this.threadId});

  final String threadId;

  @override
  State<InquiryThreadScreen> createState() => _InquiryThreadScreenState();
}

class _InquiryThreadScreenState extends State<InquiryThreadScreen> {
  final _controller = TextEditingController();
  bool _sending = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    final auth = context.read<AuthState>();
    setState(() => _sending = true);
    try {
      await context.read<InquiryRepository>().sendMessage(
            widget.threadId,
            InquiryMessage(
              id: '',
              senderId: auth.user?.id ?? '',
              senderIsAdmin: false,
              text: text,
              sentAt: DateTime.now(),
            ),
          );
      _controller.clear();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to send message.')),
        );
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SolenneColors.ivory,
      appBar: AppBar(
        title: Text('CONVERSATION', style: SolenneTypography.sectionTitle()),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: StreamBuilder<List<InquiryMessage>>(
              stream: context.read<InquiryRepository>().watchMessages(widget.threadId),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                  return const SolenneLoading();
                }
                final messages = snapshot.data ?? [];
                return ListView.builder(
                  reverse: true,
                  padding: const EdgeInsets.symmetric(
                    horizontal: SolenneSpacing.pageHorizontal,
                    vertical: SolenneSpacing.lg,
                  ),
                  itemCount: messages.length,
                  itemBuilder: (context, i) {
                    final m = messages[messages.length - 1 - i];
                    return _Bubble(message: m);
                  },
                );
              },
            ),
          ),
          _MessageInput(
            controller: _controller,
            isSending: _sending,
            onSend: _send,
          ),
        ],
      ),
    );
  }
}

class _MessageInput extends StatelessWidget {
  const _MessageInput({
    required this.controller,
    required this.isSending,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool isSending;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: SolenneSpacing.md,
          vertical: SolenneSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: SolenneColors.ivory,
          border: const Border(top: BorderSide(color: SolenneColors.line)),
        ),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                style: SolenneTypography.body(),
                maxLines: 4,
                minLines: 1,
                decoration: InputDecoration(
                  hintText: 'Write a message…',
                  hintStyle: SolenneTypography.body(color: SolenneColors.muted),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
              ),
            ),
            const SizedBox(width: 8),
            IconButton(
              icon: isSending
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: SolenneColors.midnight,
                      ),
                    )
                  : const Icon(LucideIcons.send, size: 20, color: SolenneColors.midnight),
              onPressed: isSending ? null : onSend,
            ),
          ],
        ),
      ),
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.message});
  final InquiryMessage message;

  @override
  Widget build(BuildContext context) {
    final isAdmin = message.senderIsAdmin;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: SolenneSpacing.xs),
      child: Column(
        crossAxisAlignment: isAdmin ? CrossAxisAlignment.start : CrossAxisAlignment.end,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
            decoration: BoxDecoration(
              color: isAdmin ? SolenneColors.ivoryWarm : SolenneColors.midnight,
              border: isAdmin ? Border.all(color: SolenneColors.line) : null,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(12),
                topRight: const Radius.circular(12),
                bottomLeft: Radius.circular(isAdmin ? 0 : 12),
                bottomRight: Radius.circular(isAdmin ? 12 : 0),
              ),
            ),
            child: Text(
              message.text,
              style: SolenneTypography.body(
                color: isAdmin ? SolenneColors.midnight : SolenneColors.ivory,
                fontSize: 14,
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            DateFormat('HH:mm · MMM d').format(message.sentAt),
            style: SolenneTypography.caption(fontSize: 10),
          ),
        ],
      ),
    );
  }
}
