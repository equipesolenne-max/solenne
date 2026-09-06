import '../core/utils/url_utils.dart';

/// Order model mapping Django order data.
class OrderItem {
  const OrderItem({
    required this.productId,
    required this.name,
    required this.image,
    required this.variant,
    required this.quantity,
    required this.price,
  });

  final String productId;
  final String name;
  final String image;
  final String variant;
  final int quantity;
  final double price;

  factory OrderItem.fromMap(Map<String, dynamic> map) => OrderItem(
        productId: map['product']?.toString() ?? '',
        name: map['name'] as String? ?? '',
        image: UrlUtils.sanitizeUrl(map['image'] as String? ?? ''),
        variant: map['color'] as String? ?? '',
        quantity: (map['quantity'] as num?)?.toInt() ?? 1,
        price: (map['price'] as num?)?.toDouble() ?? 0,
      );
}

enum OrderStatus { pending, confirmed, processing, shipped, delivered, cancelled, returned }

class OrderModel {
  const OrderModel({
    required this.id,
    required this.orderNumber,
    required this.items,
    required this.subtotal,
    required this.shippingCost,
    required this.total,
    required this.status,
    required this.shippingAddress,
    required this.phone,
    required this.createdAt,
  });

  final String id;
  final String orderNumber;
  final List<OrderItem> items;
  final double subtotal;
  final double shippingCost;
  final double total;
  final OrderStatus status;
  final Map<String, dynamic> shippingAddress;
  final String phone;
  final DateTime createdAt;

  factory OrderModel.fromMap(String id, Map<String, dynamic> map) {
    return OrderModel(
      id: id,
      orderNumber: map['order_number'] as String? ?? id,
      items: (map['items'] as List? ?? const [])
          .map((e) => OrderItem.fromMap(Map<String, dynamic>.from(e as Map)))
          .toList(),
      subtotal: (map['subtotal'] as num?)?.toDouble() ?? 0,
      shippingCost: (map['shipping_cost'] as num?)?.toDouble() ?? 0,
      total: (map['total'] as num?)?.toDouble() ?? 0,
      status: OrderStatus.values.firstWhere(
        (s) => s.name == (map['status'] as String? ?? 'pending'),
        orElse: () => OrderStatus.pending,
      ),
      shippingAddress: Map<String, dynamic>.from(map['shipping'] ?? {}),
      phone: map['phone'] as String? ?? '',
      createdAt: DateTime.tryParse(map['created_at'] as String? ?? '') ?? DateTime.now(),
    );
  }
}
