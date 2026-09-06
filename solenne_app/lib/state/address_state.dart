import 'package:flutter/material.dart';
import '../models/address_model.dart';
import '../services/address_repository.dart';
import 'auth_state.dart';

class AddressState extends ChangeNotifier {
  AddressState(this._repository, AuthState authState) {
    if (authState.isSignedIn) {
      fetchAddresses();
    }
    authState.addListener(() {
      if (authState.isSignedIn) {
        fetchAddresses();
      } else {
        _addresses = [];
        notifyListeners();
      }
    });
  }

  final AddressRepository _repository;
  List<AddressModel> _addresses = [];
  bool _isLoading = false;

  List<AddressModel> get addresses => List.unmodifiable(_addresses);
  bool get isLoading => _isLoading;

  Future<void> fetchAddresses() async {
    _isLoading = true;
    notifyListeners();
    try {
      _addresses = await _repository.getAddresses();
    } catch (e) {
      debugPrint('Error fetching addresses: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addAddress(AddressModel address) async {
    try {
      final newAddress = await _repository.createAddress(address);
      _addresses = [..._addresses, newAddress];
      notifyListeners();
    } catch (e) {
      debugPrint('Error adding address: $e');
      rethrow;
    }
  }

  Future<void> updateAddress(int id, AddressModel address) async {
    try {
      final updatedAddress = await _repository.updateAddress(id, address);
      final index = _addresses.indexWhere((a) => a.id == id);
      if (index != -1) {
        _addresses = List.from(_addresses);
        _addresses[index] = updatedAddress;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error updating address: $e');
      rethrow;
    }
  }

  Future<void> deleteAddress(int id) async {
    try {
      await _repository.deleteAddress(id);
      _addresses = _addresses.where((a) => a.id != id).toList();
      notifyListeners();
    } catch (e) {
      debugPrint('Error deleting address: $e');
      rethrow;
    }
  }

  Future<void> setDefault(int id) async {
    try {
      await _repository.setDefault(id);
      _addresses = _addresses.map((a) {
        return AddressModel(
          id: a.id,
          fullName: a.fullName,
          phone: a.phone,
          address: a.address,
          wilaya: a.wilaya,
          commune: a.commune,
          postalCode: a.postalCode,
          isDefault: a.id == id,
        );
      }).toList();
      notifyListeners();
    } catch (e) {
      debugPrint('Error setting default address: $e');
      rethrow;
    }
  }
}
