import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'solenne_colors.dart';

/// SOLENNE typography system.
///
/// Three roles, never mixed outside their lane:
///  - Display  (Marcellus)           — logo, headings, section titles, product names
///  - Editorial (Cormorant Garamond) — taglines, quotes, brand storytelling copy
///  - UI        (Jost)               — buttons, nav labels, forms, prices, metadata
///
/// Fonts are pulled via google_fonts so the app never depends on fonts being
/// present on-device. To fully vendor them instead, add the .ttf files under
/// assets/fonts/ and switch the TextStyle constructors below to
/// TextStyle(fontFamily: 'Marcellus', ...) etc. (see pubspec.yaml comment).
class SolenneTypography {
  SolenneTypography._();

  // --- Base font builders -----------------------------------------------

  static TextStyle _display({
    double fontSize = 16,
    FontWeight weight = FontWeight.w400,
    Color color = SolenneColors.midnight,
    double? letterSpacing,
    double? height,
  }) =>
      GoogleFonts.marcellus(
        fontSize: fontSize,
        fontWeight: weight,
        color: color,
        letterSpacing: letterSpacing,
        height: height,
      );

  static TextStyle _editorial({
    double fontSize = 16,
    FontWeight weight = FontWeight.w400,
    FontStyle style = FontStyle.normal,
    Color color = SolenneColors.midnight,
    double? letterSpacing,
    double? height,
  }) =>
      GoogleFonts.cormorantGaramond(
        fontSize: fontSize,
        fontWeight: weight,
        fontStyle: style,
        color: color,
        letterSpacing: letterSpacing,
        height: height,
      );

  static TextStyle _ui({
    double fontSize = 14,
    FontWeight weight = FontWeight.w400,
    Color color = SolenneColors.midnight,
    double? letterSpacing,
    double? height,
  }) =>
      GoogleFonts.jost(
        fontSize: fontSize,
        fontWeight: weight,
        color: color,
        letterSpacing: letterSpacing,
        height: height,
      );

  // --- Named roles used throughout the app -------------------------------

  /// Uppercase eyebrow/label text: Jost ~11px, wide tracking, gold.
  static TextStyle eyebrow({Color color = SolenneColors.gold}) => _ui(
        fontSize: 11,
        weight: FontWeight.w500,
        color: color,
        letterSpacing: 0.35 * 11, // 0.35em
      );

  /// Section title label: Marcellus ~15px, uppercase, midnight.
  /// Pair with a trailing hairline rule via SolenneSectionTitle.
  static TextStyle sectionTitle({Color color = SolenneColors.midnight}) =>
      _display(
        fontSize: 15,
        weight: FontWeight.w400,
        color: color,
        letterSpacing: 0.08 * 15,
      );

  /// Large page/section heading (Marcellus).
  static TextStyle heading({
    double fontSize = 26,
    Color color = SolenneColors.midnight,
  }) =>
      _display(fontSize: fontSize, weight: FontWeight.w400, color: color);

  /// Wordmark "SOLENNE" — Marcellus, large, wide tracking.
  static TextStyle wordmark({
    double fontSize = 28,
    Color color = SolenneColors.midnight,
  }) =>
      _display(
        fontSize: fontSize,
        weight: FontWeight.w400,
        color: color,
        letterSpacing: 0.12 * fontSize,
      );

  /// Tagline under the wordmark — Cormorant Garamond italic, small-caps feel.
  static TextStyle tagline({
    double fontSize = 12,
    Color color = SolenneColors.mutedOnDark,
  }) =>
      _editorial(
        fontSize: fontSize,
        weight: FontWeight.w400,
        style: FontStyle.italic,
        color: color,
        letterSpacing: 0.22 * fontSize,
      );

  /// Editorial body copy (storytelling voice) — Cormorant Garamond italic.
  static TextStyle editorialBody({
    double fontSize = 18,
    Color color = SolenneColors.midnight,
  }) =>
      _editorial(
        fontSize: fontSize,
        weight: FontWeight.w400,
        style: FontStyle.italic,
        color: color,
        height: 1.5,
      );

  /// Functional/product body copy — Jost regular.
  static TextStyle body({
    double fontSize = 14,
    Color color = SolenneColors.midnight,
  }) =>
      _ui(fontSize: fontSize, weight: FontWeight.w400, color: color, height: 1.5);

  /// Product name — Marcellus.
  static TextStyle productName({
    double fontSize = 16,
    Color color = SolenneColors.midnight,
  }) =>
      _display(fontSize: fontSize, weight: FontWeight.w400, color: color);

  /// Price — Jost medium.
  static TextStyle price({
    double fontSize = 15,
    Color color = SolenneColors.midnight,
  }) =>
      _ui(fontSize: fontSize, weight: FontWeight.w500, color: color);

  /// Button label — Jost, uppercase, wide tracking.
  static TextStyle button({
    double fontSize = 13,
    Color color = SolenneColors.ivory,
  }) =>
      _ui(
        fontSize: fontSize,
        weight: FontWeight.w500,
        color: color,
        letterSpacing: 0.12 * fontSize,
      );

  /// Nav label / small metadata caption.
  static TextStyle caption({
    double fontSize = 12,
    Color color = SolenneColors.muted,
  }) =>
      _ui(fontSize: fontSize, weight: FontWeight.w400, color: color);

  /// Form field label.
  static TextStyle label({
    double fontSize = 13,
    Color color = SolenneColors.midnight,
  }) =>
      _ui(fontSize: fontSize, weight: FontWeight.w400, color: color);
}
