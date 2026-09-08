import '../models/home_section_model.dart';
import '../core/network/api_client.dart';

class HomeRepository {
  HomeRepository(this._apiClient);
  final ApiClient _apiClient;

  Future<List<HomeSectionModel>> getHomeSections() async {
    try {
      final response = await _apiClient.dio.get('/home/');
      final List data = response.data;
      return data.map((item) => HomeSectionModel.fromMap(item)).toList();
    } catch (e) {
      return [];
    }
  }
}
