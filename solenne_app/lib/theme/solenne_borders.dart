import 'package:flutter/material.dart';
import 'solenne_colors.dart';

/// SOLENNE shape language: hairline borders, minimal corner radii.
///
/// No pill-shaped buttons, no heavily rounded cards. Shadows are reserved
/// almost exclusively for packaging imagery — UI elements elsewhere stay flat.
class SolenneBorders {
  SolenneBorders._();

  /// Fixed small radius used app-wide. Do not exceed this anywhere in the UI
  /// (packaging mockups are the only exception, and even those stay subtle).
  static const double radius = 2;

  static final BorderRadius borderRadius = BorderRadius.circular(radius);

  /// Standard 1px hairline border in the `line` token color.
  static const BorderSide hairlineSide = BorderSide(
    color: SolenneColors.line,
    width: 1,
  );

  static final Border hairline = Border.fromBorderSide(hairlineSide);

  /// Hairline border with rounded corners, for cards/containers.
  static OutlineInputBorder get hairlineInputBorder => OutlineInputBorder(
        borderRadius: borderRadius,
        borderSide: hairlineSide,
      );

  /// Soft drop shadow reserved for packaging imagery (box/bag mockups) only.
  static const List<BoxShadow> packagingShadow = [
    BoxShadow(
      color: Color(0x261B2A46),
      blurRadius: 24,
      offset: Offset(0, 12),
    ),
  ];
}
