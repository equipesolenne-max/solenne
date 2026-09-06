import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_empty_state.dart';
import '../components/solenne_loading.dart';
import '../../models/inquiry_model.dart';
import '../../services/inquiry_repository.dart';
import '../../state/auth_state.dart';
import 'inquiry_thread_screen.dart';
import 'new_inquiry_screen.dart';

/// Redesigned Inquiries page: elegant intro, history of past conversations,
/// and a prominent 'Add' action in the app bar.
class InquiriesScreen extends StatelessWidget {
  const InquiriesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();

    return Scaffold(
      backgroundColor: SolenneColors.ivory,
      appBar: AppBar(
        title: Text('INQUIRIES', style: SolenneTypography.sectionTitle()),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          if (auth.isSignedIn)
            IconButton(
              icon: const Icon(LucideIcons.plus, color: SolenneColors.midnight, size: 20),
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const NewInquiryScreen()),
              ),
            ),
          const SizedBox(width: SolenneSpacing.sm),
        ],
      ),
      body: auth.user == null
          ? const SolenneEmptyState(
              title: 'Welcome back',
              message: 'Sign in to start a conversation with our customer care team.',
              icon: LucideIcons.messageCircle,
            )
          : RefreshIndicator(
              onRefresh: () async => context.read<InquiryRepository>().getMyInquiries(),
              color: SolenneColors.midnight,
              backgroundColor: SolenneColors.ivory,
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _HeaderSection(),
                    const SizedBox(height: SolenneSpacing.lg),
                    _HistorySection(customerId: auth.user!.id),
                    const SizedBox(height: SolenneSpacing.xxl),
                    _CustomerCareSection(),
                    const SizedBox(height: SolenneSpacing.xxl),
                  ],
                ),
              ),
            ),
    );
  }
}

class _HeaderSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(SolenneSpacing.pageHorizontal),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'How may we assist you?',
            style: SolenneTypography.heading(fontSize: 24),
          ),
          const SizedBox(height: 12),
          Text(
            'Whether you have questions about an order, a specific piece from our collection, or shipping details, our team is here to provide thoughtful assistance.',
            style: SolenneTypography.editorialBody(fontSize: 16, color: SolenneColors.muted),
          ),
        ],
      ),
    );
  }
}

class _HistorySection extends StatelessWidget {
  const _HistorySection({required this.customerId});
  final String customerId;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: SolenneSpacing.pageHorizontal),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Divider(height: SolenneSpacing.xxl, color: SolenneColors.line),
          Text('YOUR INQUIRIES', style: SolenneTypography.eyebrow()),
          const SizedBox(height: SolenneSpacing.lg),
          StreamBuilder<List<InquiryThread>>(
            stream: context.read<InquiryRepository>().watchMyThreads(customerId),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const Center(child: SolenneLoading());
              }
              final threads = snapshot.data ?? [];
              if (threads.isEmpty) {
                return Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    'Your conversations with SOLENNE will appear here.',
                    style: SolenneTypography.body(color: SolenneColors.muted),
                  ),
                );
              }
              return Column(
                children: threads.map((t) => _InquiryCard(thread: t)).toList(),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _InquiryCard extends StatelessWidget {
  const _InquiryCard({required this.thread});
  final InquiryThread thread;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: SolenneSpacing.md),
      child: InkWell(
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => InquiryThreadScreen(threadId: thread.id)),
        ),
        borderRadius: SolenneBorders.borderRadius,
        child: Container(
          padding: const EdgeInsets.all(SolenneSpacing.md),
          decoration: BoxDecoration(
            color: SolenneColors.ivoryWarm.withOpacity(0.5),
            border: Border.all(color: SolenneColors.line),
            borderRadius: SolenneBorders.borderRadius,
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(SolenneSpacing.sm),
                decoration: BoxDecoration(
                  color: thread.unreadForCustomer ? SolenneColors.gold.withOpacity(0.1) : SolenneColors.ivory,
                  borderRadius: SolenneBorders.borderRadius,
                ),
                child: Icon(
                  LucideIcons.messageCircle,
                  size: 18,
                  color: thread.unreadForCustomer ? SolenneColors.gold : SolenneColors.muted,
                ),
              ),
              const SizedBox(width: SolenneSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      thread.subject,
                      style: SolenneTypography.body().copyWith(
                        fontWeight: thread.unreadForCustomer ? FontWeight.w600 : FontWeight.w400,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      DateFormat.yMMMd().format(thread.lastMessageAt),
                      style: SolenneTypography.caption(),
                    ),
                  ],
                ),
              ),
              if (thread.unreadForCustomer)
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: SolenneColors.gold,
                    shape: BoxShape.circle,
                  ),
                ),
              const SizedBox(width: SolenneSpacing.sm),
              const Icon(LucideIcons.chevronRight, size: 16, color: SolenneColors.line),
            ],
          ),
        ),
      ),
    );
  }
}

class _CustomerCareSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: SolenneSpacing.pageHorizontal),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Divider(color: SolenneColors.line),
          const SizedBox(height: SolenneSpacing.lg),
          Text('SOLENNE CUSTOMER CARE', style: SolenneTypography.eyebrow()),
          const SizedBox(height: 8),
          Text(
            'Thoughtful assistance, whenever you need it.',
            style: SolenneTypography.body(color: SolenneColors.muted),
          ),
        ],
      ),
    );
  }
}
