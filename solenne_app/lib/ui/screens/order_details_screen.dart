import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_loading.dart';
import '../components/solenne_price.dart';
import '../../models/order_model.dart';
import '../../services/order_repository.dart';
import '../../core/utils/url_utils.dart';

/// Redesigned Order Details page: editorial layout, status tracker, item cards,
/// and clear price breakdown.
class OrderDetailsScreen extends StatelessWidget {
  const OrderDetailsScreen({super.key, required this.orderId});

  final String orderId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SolenneColors.ivory,
      appBar: AppBar(
        title: Text('ORDER DETAILS', style: SolenneTypography.sectionTitle()),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: StreamBuilder<OrderModel?>(
        stream: context.read<OrderRepository>().watchOrder(orderId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
            return const SolenneLoading();
          }
          
          final order = snapshot.data;
          if (order == null) {
            return const Center(child: Text('Order not found'));
          }

          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(
              horizontal: SolenneSpacing.pageHorizontal,
              vertical: SolenneSpacing.lg,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _OrderHeader(order: order),
                const SizedBox(height: SolenneSpacing.xxl),
                
                _StatusTracker(status: order.status),
                const SizedBox(height: SolenneSpacing.xxl),
                
                Text('ORDER ITEMS', style: SolenneTypography.eyebrow()),
                const SizedBox(height: SolenneSpacing.md),
                ...order.items.map((item) => _OrderItemCard(item: item)),
                
                const Divider(height: SolenneSpacing.xxl, color: SolenneColors.line),
                
                _DeliverySection(order: order),
                
                const Divider(height: SolenneSpacing.xxl, color: SolenneColors.line),
                
                _OrderSummary(order: order),
                const SizedBox(height: SolenneSpacing.xxl),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _OrderHeader extends StatelessWidget {
  const _OrderHeader({required this.order});
  final OrderModel order;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'ORDER #${order.orderNumber}',
          style: SolenneTypography.heading(fontSize: 22),
        ),
        const SizedBox(height: 4),
        Text(
          'Placed on ${DateFormat.yMMMMd().format(order.createdAt)}',
          style: SolenneTypography.body(color: SolenneColors.muted),
        ),
      ],
    );
  }
}

class _StatusTracker extends StatelessWidget {
  const _StatusTracker({required this.status});
  final OrderStatus status;

  @override
  Widget build(BuildContext context) {
    final List<OrderStatus> stages = [
      OrderStatus.confirmed,
      OrderStatus.shipped,
      OrderStatus.delivered,
    ];
    
    // Check if the order is cancelled or returned
    if (status == OrderStatus.cancelled || status == OrderStatus.returned) {
      return Container(
        padding: const EdgeInsets.all(SolenneSpacing.md),
        decoration: BoxDecoration(
          color: SolenneColors.error.withOpacity(0.05),
          border: Border.all(color: SolenneColors.error.withOpacity(0.2)),
          borderRadius: SolenneBorders.borderRadius,
        ),
        child: Row(
          children: [
            const Icon(LucideIcons.alertCircle, color: SolenneColors.error, size: 20),
            const SizedBox(width: SolenneSpacing.md),
            Text(
              'This order has been ${status.name}.',
              style: SolenneTypography.body(color: SolenneColors.error),
            ),
          ],
        ),
      );
    }

    int currentStage = -1;
    if (status == OrderStatus.confirmed || status == OrderStatus.processing || status == OrderStatus.pending) {
      currentStage = 0;
    } else if (status == OrderStatus.shipped) {
      currentStage = 1;
    } else if (status == OrderStatus.delivered) {
      currentStage = 2;
    }

    return Row(
      children: List.generate(stages.length, (index) {
        final stage = stages[index];
        final isActive = index <= currentStage;
        final isLast = index == stages.length - 1;
        
        return Expanded(
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 1,
                      color: index == 0 ? Colors.transparent : (isActive ? SolenneColors.midnight : SolenneColors.line),
                    ),
                  ),
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isActive ? SolenneColors.midnight : SolenneColors.line,
                    ),
                  ),
                  Expanded(
                    child: Container(
                      height: 1,
                      color: isLast ? Colors.transparent : (index < currentStage ? SolenneColors.midnight : SolenneColors.line),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                stage.name.toUpperCase(),
                style: SolenneTypography.eyebrow(
                  color: isActive ? SolenneColors.midnight : SolenneColors.muted,
                ).copyWith(fontSize: 8),
              ),
            ],
          ),
        );
      }),
    );
  }
}

class _OrderItemCard extends StatelessWidget {
  const _OrderItemCard({required this.item});
  final OrderItem item;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: SolenneSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 70,
            height: 90,
            decoration: BoxDecoration(
              color: SolenneColors.ivoryWarm,
              borderRadius: SolenneBorders.borderRadius,
              border: Border.all(color: SolenneColors.line),
            ),
            clipBehavior: Clip.antiAlias,
            child: item.image.isNotEmpty
                ? UrlUtils.buildImage(item.image, fit: BoxFit.cover)
                : const Icon(LucideIcons.package, size: 24, color: SolenneColors.line),
          ),
          const SizedBox(width: SolenneSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  style: SolenneTypography.productName(fontSize: 15),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  'COLOR: ${item.variant.toUpperCase()}',
                  style: SolenneTypography.caption(),
                ),
                const SizedBox(height: 2),
                Text(
                  'QUANTITY: ${item.quantity}',
                  style: SolenneTypography.caption(),
                ),
              ],
            ),
          ),
          const SizedBox(width: SolenneSpacing.md),
          SolennePrice(amount: item.price * item.quantity, fontSize: 14),
        ],
      ),
    );
  }
}

class _DeliverySection extends StatelessWidget {
  const _DeliverySection({required this.order});
  final OrderModel order;

  @override
  Widget build(BuildContext context) {
    final addr = order.shippingAddress;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('SHIPPING ADDRESS', style: SolenneTypography.eyebrow()),
        const SizedBox(height: SolenneSpacing.md),
        Text(
          '${addr['full_name'] ?? ''}',
          style: SolenneTypography.body().copyWith(fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 4),
        Text(
          '${addr['address'] ?? ''}\n${addr['commune'] ?? ''}, ${addr['wilaya'] ?? ''}',
          style: SolenneTypography.body(color: SolenneColors.muted),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            const Icon(LucideIcons.phone, size: 14, color: SolenneColors.muted),
            const SizedBox(width: 8),
            Text(
              order.phone,
              style: SolenneTypography.body(color: SolenneColors.muted),
            ),
          ],
        ),
      ],
    );
  }
}

class _OrderSummary extends StatelessWidget {
  const _OrderSummary({required this.order});
  final OrderModel order;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('SUMMARY', style: SolenneTypography.eyebrow()),
        const SizedBox(height: SolenneSpacing.md),
        _PriceRow(label: 'Subtotal', amount: order.subtotal),
        const SizedBox(height: 8),
        _PriceRow(label: 'Shipping', amount: order.shippingCost),
        const SizedBox(height: SolenneSpacing.md),
        const Divider(color: SolenneColors.line),
        const SizedBox(height: SolenneSpacing.md),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'TOTAL',
              style: SolenneTypography.body().copyWith(fontWeight: FontWeight.w700),
            ),
            SolennePrice(
              amount: order.total,
              fontSize: 18,
            ),
          ],
        ),
      ],
    );
  }
}

class _PriceRow extends StatelessWidget {
  const _PriceRow({required this.label, required this.amount});
  final String label;
  final double amount;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: SolenneTypography.body(color: SolenneColors.muted)),
        SolennePrice(amount: amount, fontSize: 14, color: SolenneColors.muted),
      ],
    );
  }
}
