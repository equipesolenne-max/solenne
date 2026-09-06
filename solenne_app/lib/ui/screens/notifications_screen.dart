import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_empty_state.dart';
import '../components/solenne_loading.dart';
import '../../models/notification_model.dart';
import '../../state/notification_state.dart';
import '../../state/auth_state.dart';
import 'order_details_screen.dart';
import 'product_details_screen.dart';

/// Redesigned Notifications page: organized by date, editorial hierarchy,
/// and clear visual distinction between read/unread states.
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();

    return Scaffold(
      backgroundColor: SolenneColors.ivory,
      appBar: AppBar(
        title: Text('NOTIFICATIONS', style: SolenneTypography.sectionTitle()),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          Consumer<NotificationState>(
            builder: (context, state, _) {
              if (state.unreadCount == 0) return const SizedBox.shrink();
              return TextButton(
                onPressed: state.markAllAsRead,
                child: Text(
                  'MARK ALL READ',
                  style: SolenneTypography.button(fontSize: 11, color: SolenneColors.gold),
                ),
              );
            },
          ),
          const SizedBox(width: SolenneSpacing.sm),
        ],
      ),
      body: auth.user == null
          ? const SolenneEmptyState(
              title: 'Welcome back',
              message: 'Sign in to see updates on your orders and wishlist.',
              icon: LucideIcons.bell,
            )
          : Consumer<NotificationState>(
              builder: (context, state, child) {
                if (state.isLoading && state.notifications.isEmpty) {
                  return const SolenneLoading();
                }

                if (state.notifications.isEmpty) {
                  return const SolenneEmptyState(
                    title: "You're all caught up",
                    message: "There are no new notifications at the moment.",
                    icon: LucideIcons.bell,
                  );
                }

                final grouped = _groupNotifications(state.notifications);

                return RefreshIndicator(
                  onRefresh: state.fetchNotifications,
                  color: SolenneColors.midnight,
                  backgroundColor: SolenneColors.ivory,
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(
                      horizontal: SolenneSpacing.pageHorizontal,
                      vertical: SolenneSpacing.lg,
                    ),
                    itemCount: grouped.length + 1,
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: SolenneSpacing.lg),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'STAY INFORMED',
                                style: SolenneTypography.eyebrow(),
                              ),
                              const SizedBox(height: SolenneSpacing.xs),
                              Text(
                                'Updates on your orders, curated collections, and atelier news.',
                                style: SolenneTypography.body(
                                  fontSize: 15,
                                  color: SolenneColors.muted,
                                ),
                              ),
                            ],
                          ),
                        );
                      }

                      final section = grouped[index - 1];
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(
                              left: 4,
                              top: SolenneSpacing.lg,
                              bottom: SolenneSpacing.md,
                            ),
                            child: Text(
                              section.title.toUpperCase(),
                              style: SolenneTypography.eyebrow(color: SolenneColors.muted),
                            ),
                          ),
                          ...section.items.asMap().entries.map((entry) {
                            final i = entry.key;
                            final n = entry.value;
                            return _StaggeredFadeIn(
                              delay: i * 50,
                              child: _NotificationItem(notification: n),
                            );
                          }),
                        ],
                      );
                    },
                  ),
                );
              },
            ),
    );
  }

  List<_NotificationSectionData> _groupNotifications(List<NotificationModel> notifications) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));

    final List<NotificationModel> todayItems = [];
    final List<NotificationModel> yesterdayItems = [];
    final List<NotificationModel> earlierItems = [];

    for (var n in notifications) {
      final date = DateTime(n.createdAt.year, n.createdAt.month, n.createdAt.day);
      if (date == today) {
        todayItems.add(n);
      } else if (date == yesterday) {
        yesterdayItems.add(n);
      } else {
        earlierItems.add(n);
      }
    }

    final List<_NotificationSectionData> sections = [];
    if (todayItems.isNotEmpty) sections.add(_NotificationSectionData('Today', todayItems));
    if (yesterdayItems.isNotEmpty) sections.add(_NotificationSectionData('Yesterday', yesterdayItems));
    if (earlierItems.isNotEmpty) sections.add(_NotificationSectionData('Earlier', earlierItems));

    return sections;
  }
}

class _NotificationSectionData {
  final String title;
  final List<NotificationModel> items;
  _NotificationSectionData(this.title, this.items);
}

class _NotificationItem extends StatelessWidget {
  const _NotificationItem({required this.notification});
  final NotificationModel notification;

  @override
  Widget build(BuildContext context) {
    final state = context.read<NotificationState>();
    final isUnread = !notification.read;

    return Padding(
      padding: const EdgeInsets.only(bottom: SolenneSpacing.md),
      child: InkWell(
        onTap: () {
          state.markAsRead(notification.id);
          _handleNavigation(context, notification.url);
        },
        borderRadius: SolenneBorders.borderRadius,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          padding: const EdgeInsets.all(SolenneSpacing.md),
          decoration: BoxDecoration(
            color: isUnread ? SolenneColors.ivoryWarm : Colors.transparent,
            border: Border.all(
              color: isUnread ? SolenneColors.line : Colors.transparent,
            ),
            borderRadius: SolenneBorders.borderRadius,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _NotificationIcon(title: notification.title, isUnread: isUnread),
              const SizedBox(width: SolenneSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            notification.title,
                            style: SolenneTypography.body().copyWith(
                              fontWeight: isUnread ? FontWeight.w600 : FontWeight.w400,
                              color: isUnread ? SolenneColors.midnight : SolenneColors.muted,
                            ),
                          ),
                        ),
                        Text(
                          _formatTime(notification.createdAt),
                          style: SolenneTypography.caption(
                            color: isUnread ? SolenneColors.gold : SolenneColors.muted,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      notification.message,
                      style: SolenneTypography.body(
                        fontSize: 13,
                        color: isUnread ? SolenneColors.midnight.withOpacity(0.8) : SolenneColors.muted,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              if (isUnread) ...[
                const SizedBox(width: SolenneSpacing.sm),
                Container(
                  width: 6,
                  height: 6,
                  margin: const EdgeInsets.only(top: 8),
                  decoration: const BoxDecoration(
                    color: SolenneColors.gold,
                    shape: BoxShape.circle,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _formatTime(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return DateFormat.MMMd().format(date);
  }

  void _handleNavigation(BuildContext context, String url) {
    if (url.isEmpty) return;
    final uri = Uri.tryParse(url);
    if (uri == null) return;

    final segments = uri.pathSegments;
    if (segments.contains('orders') && segments.length > 1) {
      final orderId = segments[segments.indexOf('orders') + 1];
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => OrderDetailsScreen(orderId: orderId)),
      );
    } else if (segments.contains('products') && segments.length > 1) {
      final productId = segments[segments.indexOf('products') + 1];
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => ProductDetailsScreen(productId: productId)),
      );
    }
    // Add more navigation logic here if needed (e.g. products)
  }
}

class _NotificationIcon extends StatelessWidget {
  const _NotificationIcon({required this.title, required this.isUnread});
  final String title;
  final bool isUnread;

  @override
  Widget build(BuildContext context) {
    IconData iconData = LucideIcons.bell;
    final t = title.toLowerCase();

    if (t.contains('order') || t.contains('shipped') || t.contains('delivered')) {
      iconData = LucideIcons.package;
    } else if (t.contains('wishlist') || t.contains('stock') || t.contains('favorite')) {
      iconData = LucideIcons.heart;
    } else if (t.contains('arrival') || t.contains('collection')) {
      iconData = LucideIcons.sparkles;
    } else if (t.contains('offer') || t.contains('promotion') || t.contains('sale')) {
      iconData = LucideIcons.tag;
    }

    return Container(
      padding: const EdgeInsets.all(SolenneSpacing.sm),
      decoration: BoxDecoration(
        color: isUnread ? SolenneColors.ivory : SolenneColors.ivoryWarm.withOpacity(0.5),
        borderRadius: SolenneBorders.borderRadius,
      ),
      child: Icon(
        iconData,
        size: 18,
        color: isUnread ? SolenneColors.midnight : SolenneColors.muted,
      ),
    );
  }
}

class _StaggeredFadeIn extends StatefulWidget {
  const _StaggeredFadeIn({required this.child, required this.delay});
  final Widget child;
  final int delay;

  @override
  State<_StaggeredFadeIn> createState() => _StaggeredFadeInState();
}

class _StaggeredFadeInState extends State<_StaggeredFadeIn> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacity;
  late Animation<Offset> _offset;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _opacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 1.0, curve: Curves.easeOut),
      ),
    );

    _offset = Tween<Offset>(begin: const Offset(0, 0.05), end: Offset.zero).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 1.0, curve: Curves.easeOut),
      ),
    );

    Future.delayed(Duration(milliseconds: widget.delay), () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _opacity,
      child: SlideTransition(
        position: _offset,
        child: widget.child,
      ),
    );
  }
}
