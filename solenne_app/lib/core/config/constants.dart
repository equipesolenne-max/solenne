class Constants {
  // Use http://10.0.2.2:8000 for Android emulator to access localhost
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000/api',
  );
}
