import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

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

  /// Returns an Image widget for a given URL source.
  /// Standardizes image loading across the app using the new Media API.
  static Widget buildImage(String source, {BoxFit fit = BoxFit.cover, Widget? fallback}) {
    if (source.isEmpty) {
      return fallback ?? const Center(child: Icon(Icons.image_outlined, color: Colors.grey));
    }

    // New architecture always returns absolute URLs to the Media API.
    return Image.network(
      sanitizeUrl(source),
      fit: fit,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return Center(
          child: CircularProgressIndicator(
            value: loadingProgress.expectedTotalBytes != null
                ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                : null,
            strokeWidth: 1,
          ),
        );
      },
      errorBuilder: (context, error, stackTrace) {
        debugPrint('Error loading image: $source - $error');
        return fallback ?? const Center(child: Icon(Icons.broken_image_outlined, color: Colors.red));
      },
    );
  }
}
