import 'dart:io';
import 'package:flutter/foundation.dart';

class UrlUtils {
  /// Sanitizes URLs returned by the backend.
  /// Replaces 'localhost' with '10.0.2.2' if running on an Android emulator.
  static String sanitizeUrl(String url) {
    if (url.isEmpty) return url;
    
    // If we're on Android and the URL contains localhost, swap it to 10.0.2.2
    if (!kIsWeb && Platform.isAndroid && url.contains('localhost')) {
      return url.replaceFirst('localhost', '10.0.2.2');
    }
    
    return url;
  }

  static List<String> sanitizeUrls(List<String> urls) {
    return urls.map((url) => sanitizeUrl(url)).toList();
  }
}
