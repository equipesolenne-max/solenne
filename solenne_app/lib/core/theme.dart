import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class SolenneColors {
  static const Color midnight = Color(0xFF1B2A46);
  static const Color midnightDeep = Color(0xFF101B30);
  static const Color ivory = Color(0xFFF8F4EC);
  static const Color ivoryWarm = Color(0xFFF3EDE1);
  static const Color beige = Color(0xFFDCD0BB);
  static const Color beigeSoft = Color(0xFFE9E0D2);
  static const Color gold = Color(0xFFC6A369);
  static const Color goldSoft = Color(0xFFD9C39C);
  static const Color line = Color(0x241B2A46); // rgba(27,42,70,0.14)
}

class SolenneTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: SolenneColors.ivory,
      colorScheme: const ColorScheme.light(
        primary: SolenneColors.midnight,
        onPrimary: SolenneColors.ivory,
        secondary: SolenneColors.gold,
        onSecondary: SolenneColors.midnight,
        surface: SolenneColors.ivory,
        onSurface: SolenneColors.midnight,
        outline: SolenneColors.line,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.marcellus(
          color: SolenneColors.midnight,
          fontSize: 32,
          letterSpacing: 0.02,
        ),
        displayMedium: GoogleFonts.marcellus(
          color: SolenneColors.midnight,
          fontSize: 24,
          letterSpacing: 0.02,
        ),
        titleLarge: GoogleFonts.marcellus(
          color: SolenneColors.midnight,
          fontSize: 20,
        ),
        bodyLarge: GoogleFonts.jost(
          color: SolenneColors.midnight,
          fontSize: 16,
        ),
        bodyMedium: GoogleFonts.jost(
          color: SolenneColors.midnight.withOpacity(0.7),
          fontSize: 14,
        ),
        labelLarge: GoogleFonts.jost(
          color: SolenneColors.midnight,
          fontSize: 12,
          letterSpacing: 0.2,
          fontWeight: FontWeight.w500,
        ),
        headlineSmall: GoogleFonts.cormorantGaramond(
          color: SolenneColors.midnight,
          fontSize: 18,
          fontStyle: FontStyle.italic,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: SolenneColors.ivory,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.marcellus(
          color: SolenneColors.midnight,
          fontSize: 20,
          letterSpacing: 0.14,
        ),
        iconTheme: const IconThemeData(color: SolenneColors.midnight),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: SolenneColors.ivory,
        selectedItemColor: SolenneColors.midnight,
        unselectedItemColor: Color(0x801B2A46),
        selectedLabelStyle: TextStyle(fontSize: 10, letterSpacing: 0.1),
        unselectedLabelStyle: TextStyle(fontSize: 10, letterSpacing: 0.1),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: SolenneColors.midnight,
          foregroundColor: SolenneColors.ivory,
          minimumSize: const Size.fromHeight(56),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(4),
          ),
          textStyle: GoogleFonts.jost(
            fontSize: 12,
            letterSpacing: 0.22,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
