import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';
import '../models/customer_model.dart';

class AuthState extends ChangeNotifier {
  AuthState(this._authService) {
    _authService.authState.listen((user) {
      _user = user;
      notifyListeners();
    });
  }

  final AuthService _authService;
  CustomerModel? _user;

  CustomerModel? get user => _user;
  bool get isSignedIn => _user != null;

  Future<void> signIn(String email, String password) async {
    await _authService.signIn(email: email, password: password);
    // Fetch cart and wishlist after sign in
    // Note: You'll need to pass the states to this method or use a listener in CartState/WishlistState
  }

  Future<void> register(String email, String password) async {
    await _authService.register(email: email, password: password);
  }

  Future<void> signOut() => _authService.signOut();
}
