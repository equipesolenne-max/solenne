import '../core/network/api_client.dart';
import '../models/address_model.dart';

class AddressRepository {
  AddressRepository(this._apiClient);
  final ApiClient _apiClient;

  Future<List<AddressModel>> getAddresses() async {
    final response = await _apiClient.dio.get('/addresses/');
    final List data = response.data;
    return data.map((item) => AddressModel.fromMap(item)).toList();
  }

  Future<AddressModel> createAddress(AddressModel address) async {
    final response = await _apiClient.dio.post('/addresses/', data: address.toMap());
    return AddressModel.fromMap(response.data);
  }

  Future<AddressModel> updateAddress(int id, AddressModel address) async {
    final response = await _apiClient.dio.patch('/addresses/$id/', data: address.toMap());
    return AddressModel.fromMap(response.data);
  }

  Future<void> deleteAddress(int id) async {
    await _apiClient.dio.delete('/addresses/$id/');
  }

  Future<void> setDefault(int id) async {
    await _apiClient.dio.post('/addresses/$id/default/');
  }
}
