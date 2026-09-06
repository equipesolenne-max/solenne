import 'package:flutter/foundation.dart';
import '../services/wishlist_repository.dart';
import 'auth_state.dart';

class WishlistState extends ChangeNotifier {
  WishlistState(this._repository, AuthState authState) {
    if (authState.isSignedIn) {
      fetchWishlist();
    }
    authState.addListener(() {
      if (authState.isSignedIn) {
        fetchWishlist();
      } else {
        _productIds.clear();
        notifyListeners();
      }
    });
  }
  final WishlistRepository _repository;

  final Set<String> _productIds = {};
  bool _isLoading = false;

  Set<String> get productIds => Set.unmodifiable(_productIds);
  bool get isLoading => _isLoading;

  bool isWishlisted(String productId) => _productIds.contains(productId);

  Future<void> fetchWishlist() async {
    final token = await _repository.apiClient.getToken();
    if (token == null) return;

    _isLoading = true;
    notifyListeners();
    try {
      final ids = await _repository.getWishlist();
      _productIds.clear();
      _productIds.addAll(ids);
    } catch (e) {
      debugPrint('Error fetching wishlist: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> toggle(String productId) async {
    final newIds = Set<String>.from(_productIds);
    if (newIds.contains(productId)) {
      newIds.remove(productId);
    } else {
      newIds.add(productId);
    }
    
    // Optimistic update
    final oldIds = Set<String>.from(_productIds);
    _productIds.clear();
    _productIds.addAll(newIds);
    notifyListeners();

    try {
      await _repository.updateWishlist(newIds.toList());
    } catch (e) {
      debugPrint('Error updating wishlist: $e');
      // Rollback
      _productIds.clear();
      _productIds.addAll(oldIds);
      notifyListeners();
    }
  }
}
