import 'package:flutter/foundation.dart';
import '../models/product_model.dart';
import '../services/cart_repository.dart';
import 'auth_state.dart';

class CartLine {
  CartLine({
    required this.id,
    required this.product,
    required this.variantName,
    required this.variantId,
    this.quantity = 1,
  });

  final int id; // Django CartItem ID
  final ProductModel product;
  final String variantName;
  final String variantName;
  final int? variantId;
  int quantity;

  double get lineTotal => product.price * quantity;

  String get key => '${product.id}_$variantName';
}

class CartState extends ChangeNotifier {
  CartState(this._repository, AuthState authState) {
    if (authState.isSignedIn) {
      fetchCart();
    }
    authState.addListener(() {
      if (authState.isSignedIn) {
        fetchCart();
      } else {
        clearLocal();
      }
    });
  }
  final CartRepository _repository;

  final Map<String, CartLine> _lines = {};
  bool _isLoading = false;

  List<CartLine> get lines => _lines.values.toList(growable: false);
  int get itemCount => _lines.values.fold(0, (sum, l) => sum + l.quantity);
  double get subtotal => _lines.values.fold(0.0, (sum, l) => sum + l.lineTotal);
  bool get isLoading => _isLoading;

  Future<void> fetchCart() async {
    final token = await _repository.apiClient.getToken();
    if (token == null) return;

    _isLoading = true;
    notifyListeners();
    try {
      final data = await _repository.getCart();
      _lines.clear();
      for (var item in data['items']) {
        final productData = item['product'];
        final product = ProductModel.fromMap(productData['id'].toString(), productData);
        final variantId = item['variant_id'];
        // Find variant name if possible
        String vName = '';
        if (variantId != null) {
          final v = product.variants.firstWhere((v) => v.id == variantId, orElse: () => const ProductVariantModel(id: 0, name: '', hex: '', stock: 0));
          vName = v.name;
        }
        
        final line = CartLine(
          id: item['id'],
          product: product,
          variantName: vName,
          variantId: variantId,
          quantity: item['quantity'],
        );
        _lines[line.key] = line;
      }
    } catch (e) {
      debugPrint('Error fetching cart: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> add(ProductModel product, {ProductVariantModel? variant, int quantity = 1}) async {
    try {
      await _repository.addItem(product.id, variant?.id, quantity);
      await fetchCart();
    } catch (e) {
      debugPrint('Error adding to cart: $e');
    }
  }

  Future<void> updateQuantity(String key, int quantity) async {
    final line = _lines[key];
    if (line == null) return;
    
    try {
      if (quantity <= 0) {
        await _repository.removeItem(line.id);
      } else {
        await _repository.updateItem(line.id, quantity);
      }
      await fetchCart();
    } catch (e) {
      debugPrint('Error updating quantity: $e');
    }
  }

  Future<void> remove(String key) async {
    final line = _lines[key];
    if (line == null) return;
    try {
      await _repository.removeItem(line.id);
      await fetchCart();
    } catch (e) {
      debugPrint('Error removing item: $e');
    }
  }

  void clearLocal() {
    _lines.clear();
    notifyListeners();
  }
}
