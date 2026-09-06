import 'dart:async';
import 'package:dio/dio.dart';
import '../core/network/api_client.dart';
import '../models/customer_model.dart';

class AuthService {
  AuthService(this._apiClient) {
    _apiClient.onUnauthorized = signOut;
    _init();
  }

  final ApiClient _apiClient;
  final _userController = StreamController<CustomerModel?>.broadcast();
  CustomerModel? _currentUser;

  Stream<CustomerModel?> get authState => _userController.stream;
  CustomerModel? get currentUser => _currentUser;

  Future<void> _init() async {
    final token = await _apiClient.getToken();
    if (token != null) {
      await fetchMe();
    } else {
      _userController.add(null);
    }
  }

  Future<void> fetchMe() async {
    try {
      final response = await _apiClient.dio.get('/auth/me/');
      _currentUser = CustomerModel.fromMap(response.data['id'].toString(), response.data);
      _userController.add(_currentUser);
    } catch (e) {
      await signOut();
    }
  }

  Future<void> signIn({required String email, required String password}) async {
    try {
      final response = await _apiClient.dio.post('/auth/login/', data: {
        'email': email,
        'password': password,
      });
      
      final token = response.data['access'];
      await _apiClient.saveToken(token);
      
      _currentUser = CustomerModel.fromMap(response.data['user']['id'].toString(), response.data['user']);
      _userController.add(_currentUser);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> register({required String email, required String password}) async {
    try {
      final response = await _apiClient.dio.post('/auth/register/', data: {
        'email': email,
        'password': password,
      });
      
      final token = response.data['access'];
      await _apiClient.saveToken(token);
      
      _currentUser = CustomerModel.fromMap(response.data['user']['id'].toString(), response.data['user']);
      _userController.add(_currentUser);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> sendPasswordReset(String email) async {
    await _apiClient.dio.post('/auth/password-reset/', data: {'email': email});
  }

  Future<void> signOut() async {
    await _apiClient.deleteToken();
    _currentUser = null;
    _userController.add(null);
  }
}
