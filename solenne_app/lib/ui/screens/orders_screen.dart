import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_empty_state.dart';
import '../components/solenne_loading.dart';
import '../components/solenne_price.dart';
import '../../models/order_model.dart';
import '../../services/order_repository.dart';
import '../../state/auth_state.dart';
import 'order_details_screen.dart';

/// Redesigned Orders page: editorial header, premium cards, status indicators,
/// and smooth staggered animations.
class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();

    return Scaffold(
      backgroundColor: SolenneColors.ivory,
      appBar: AppBar(
        title: Text('MY ORDERS', style: SolenneTypography.sectionTitle()),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: auth.user == null
          ? const SolenneEmptyState(
              title: 'Welcome back',
              message: 'Sign in to view and track your orders.',
              icon: LucideIcons.package,
            )
          : StreamBuilder<List<OrderModel>>(
              stream: context.read<OrderRepository>().watchMyOrders(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                  return const SolenneLoading();
                }
                
                if (snapshot.hasError) {
                  return const SolenneEmptyState(
                    title: 'Something went wrong',
                    message: 'We couldn’t load your orders. Please try again.',
                    icon: LucideIcons.alertTriangle,
                  );
                }

                final orders = snapshot.data ?? [];
                if (orders.isEmpty) {
                  return const SolenneEmptyState(
                    title: 'No orders yet',
                    message: 'Your future Solenne pieces will appear here.',
                    icon: LucideIcons.package,
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => context.read<OrderRepository>().getMyOrders(),
                  color: SolenneColors.midnight,
                  backgroundColor: SolenneColors.ivory,
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(
                      horizontal: SolenneSpacing.pageHorizontal,
                      vertical: SolenneSpacing.lg,
                    ),
                    itemCount: orders.length + 1,
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: SolenneSpacing.xl),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('ORDER HISTORY', style: SolenneTypography.eyebrow()),
                              const SizedBox(height: SolenneSpacing.xs),
                              Text(
                                'Track your deliveries and view past purchases.',
                                style: SolenneTypography.body(
                                  fontSize: 15,
                                  color: SolenneColors.muted,
                                ),
                              ),
                            ],
                          ),
                        );
                      }

                      final order = orders[index - 1];
                      return _StaggeredFadeIn(
                        delay: (index - 1) * 50,
                        child: _OrderCard(order: order),
                      );
                    },
                  ),
                );
              },
            ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order});
  final OrderModel order;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: SolenneSpacing.md),
      child: InkWell(
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => OrderDetailsScreen(orderId: order.id)),
        ),
        borderRadius: SolenneBorders.borderRadius,
        child: Container(
          decoration: BoxDecoration(
            color: SolenneColors.ivoryWarm,
            border: Border.all(color: SolenneColors.line),
            borderRadius: SolenneBorders.borderRadius,
          ),
          padding: const EdgeInsets.all(SolenneSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'ORDER #${order.orderNumber}',
                        style: SolenneTypography.body().copyWith(
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        DateFormat.yMMMMd().format(order.createdAt),
                        style: SolenneTypography.caption(),
                      ),
                    ],
                  ),
                  _StatusBadge(status: order.status),
                ],
              ),
              const SizedBox(height: SolenneSpacing.lg),
              Row(
                children: [
                  _OrderPreview(items: order.items),
                  const SizedBox(width: SolenneSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${order.items.length} ${order.items.length == 1 ? 'Item' : 'Items'}',
                          style: SolenneTypography.body(fontSize: 13),
                        ),
                        const SizedBox(height: 4),
                        SolennePrice(amount: order.total, fontSize: 16),
                      ],
                    ),
                  ),
                  const Icon(LucideIcons.chevronRight, size: 16, color: SolenneColors.line),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _OrderPreview extends StatelessWidget {
  const _OrderPreview({required this.items});
  final List<OrderItem> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();
    
    return Container(
      width: 60,
      height: 60,
      decoration: BoxDecoration(
        color: SolenneColors.ivory,
        borderRadius: SolenneBorders.borderRadius,
        border: Border.all(color: SolenneColors.line),
      ),
      clipBehavior: Clip.antiAlias,
      child: items.first.image.isNotEmpty
          ? Image.network(
              items.first.image,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => const Icon(LucideIcons.package, size: 20, color: SolenneColors.line),
            )
          : const Icon(LucideIcons.package, size: 20, color: SolenneColors.line),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});
  final OrderStatus status;

  @override
  Widget build(BuildContext context) {
    Color color = SolenneColors.midnight;
    
    switch (status) {
      case OrderStatus.pending:
      case OrderStatus.confirmed:
      case OrderStatus.processing:
        color = SolenneColors.gold;
        break;
      case OrderStatus.shipped:
        color = SolenneColors.midnight;
        break;
      case OrderStatus.delivered:
        color = SolenneColors.success;
        break;
      case OrderStatus.cancelled:
      case OrderStatus.returned:
        color = SolenneColors.error;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(2),
      ),
      child: Text(
        status.name.toUpperCase(),
        style: SolenneTypography.eyebrow(color: color).copyWith(fontSize: 9),
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
