import 'package:flutter/material.dart';
import 'solenne_colors.dart';
import 'solenne_typography.dart';
import 'solenne_borders.dart';
import 'solenne_spacing.dart';

export 'solenne_colors.dart';
export 'solenne_typography.dart';
export 'solenne_borders.dart';
export 'solenne_spacing.dart';

/// Central SOLENNE design system entry point.
///
/// Never scatter raw colors/text styles across widgets — pull them from
/// SolenneColors / SolenneTypography / SolenneSpacing / SolenneBorders, or
/// from `Theme.of(context)` where a MaterialApp-level style is needed.
class SolenneTheme {
  SolenneTheme._();

  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: SolenneColors.ivory,
      colorScheme: ColorScheme.fromSeed(
        seedColor: SolenneColors.midnight,
        brightness: Brightness.light,
        primary: SolenneColors.midnight,
        surface: SolenneColors.ivory,
        error: SolenneColors.error,
      ),
      dividerColor: SolenneColors.line,
      splashFactory: NoSplash.splashFactory,
      highlightColor: Colors.transparent,
      appBarTheme: AppBarTheme(
        backgroundColor: SolenneColors.ivory,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: SolenneColors.midnight),
        titleTextStyle: SolenneTypography.wordmark(fontSize: 18),
      ),
      textTheme: TextTheme(
        headlineMedium: SolenneTypography.heading(),
        titleMedium: SolenneTypography.sectionTitle(),
        bodyMedium: SolenneTypography.body(),
        labelLarge: SolenneTypography.button(color: SolenneColors.midnight),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: primaryButtonStyle,
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: secondaryButtonStyle,
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: SolenneColors.midnight,
          textStyle: SolenneTypography.button(color: SolenneColors.midnight),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: false,
        contentPadding: const EdgeInsets.symmetric(
          vertical: SolenneSpacing.md,
          horizontal: SolenneSpacing.md,
        ),
        labelStyle: SolenneTypography.label(color: SolenneColors.muted),
        border: SolenneBorders.hairlineInputBorder,
        enabledBorder: SolenneBorders.hairlineInputBorder,
        focusedBorder: SolenneBorders.hairlineInputBorder.copyWith(
          borderSide: const BorderSide(color: SolenneColors.midnight, width: 1),
        ),
        errorBorder: SolenneBorders.hairlineInputBorder.copyWith(
          borderSide: const BorderSide(color: SolenneColors.error, width: 1),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: SolenneColors.line,
        thickness: 1,
        space: 1,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: SolenneColors.ivory,
        selectedItemColor: SolenneColors.midnight,
        unselectedItemColor: SolenneColors.muted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
        },
      ),
    );
  }

  /// Primary button: midnight fill / ivory text. Flat, no heavy shadow.
  static final ButtonStyle primaryButtonStyle = ElevatedButton.styleFrom(
    backgroundColor: SolenneColors.midnight,
    foregroundColor: SolenneColors.ivory,
    disabledBackgroundColor: SolenneColors.muted.withOpacity(0.3),
    elevation: 0,
    shadowColor: Colors.transparent,
    padding: const EdgeInsets.symmetric(
      vertical: SolenneSpacing.md,
      horizontal: SolenneSpacing.lg,
    ),
    shape: RoundedRectangleBorder(borderRadius: SolenneBorders.borderRadius),
    textStyle: SolenneTypography.button(color: SolenneColors.ivory),
  );

  /// Secondary button: ivory fill / midnight hairline border / midnight text.
  static final ButtonStyle secondaryButtonStyle = OutlinedButton.styleFrom(
    backgroundColor: SolenneColors.ivory,
    foregroundColor: SolenneColors.midnight,
    side: SolenneBorders.hairlineSide.copyWith(color: SolenneColors.midnight),
    elevation: 0,
    padding: const EdgeInsets.symmetric(
      vertical: SolenneSpacing.md,
      horizontal: SolenneSpacing.lg,
    ),
    shape: RoundedRectangleBorder(borderRadius: SolenneBorders.borderRadius),
    textStyle: SolenneTypography.button(color: SolenneColors.midnight),
  );
}
