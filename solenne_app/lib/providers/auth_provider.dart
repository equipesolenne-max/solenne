import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService apiService;
  String? _token;
  bool _isLoading = false;
  String? _error;

  AuthProvider(this.apiService);

  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _token != null;

  Future<void> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/auth/login/'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _token = data['access'];
        apiService.setToken(_token!);
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', _token!);
        
        notifyListeners();
      } else {
        final data = json.decode(response.body);
        _error = data['detail'] ?? 'Login failed';
      }
    } catch (e) {
      _error = 'Connection error';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey('token')) return;
    
    _token = prefs.getString('token');
    apiService.setToken(_token!);
    notifyListeners();
  }

  Future<void> logout() async {
    _token = null;
    apiService.setToken('');
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    notifyListeners();
  }
}
