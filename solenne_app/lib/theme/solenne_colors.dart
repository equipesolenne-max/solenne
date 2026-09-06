import 'package:flutter/material.dart';

/// SOLENNE color tokens — the exact palette from the brand identity system.
///
/// Rule: gold is an accent, never a dominant fill. Do not introduce colors
/// outside this palette except muted/desaturated system feedback states.
class SolenneColors {
  SolenneColors._();

  /// Primary brand color — text, icons, primary buttons, logo on light bg.
  static const Color midnight = Color(0xFF1B2A46);

  /// Gradients, dark surfaces, box packaging shadow tone.
  static const Color midnightDeep = Color(0xFF101B30);

  /// Mid-tone used in the packaging box gradient (midnight -> midnightDeep).
  static const Color midnightGradientTop = Color(0xFF223357);

  /// Primary background.
  static const Color ivory = Color(0xFFF8F4EC);

  /// Card / section background, alt surface.
  static const Color ivoryWarm = Color(0xFFF3EDE1);

  /// Soft neutral accents, bag handles.
  static const Color beige = Color(0xFFDCD0BB);

  /// Secondary neutral surface.
  static const Color beigeSoft = Color(0xFFE9E0D2);

  /// Champagne gold accent — sparingly, for accents only.
  static const Color gold = Color(0xFFC6A369);

  /// Gold on dark surfaces, tags, ribbon gradient top.
  static const Color goldSoft = Color(0xFFD9C39C);

  /// Subtle borders/dividers — midnight at 14% opacity.
  static const Color line = Color(0x241B2A46);

  /// Captions, secondary labels on light backgrounds.
  static const Color muted = Color(0xFF8A8F9C);

  /// Captions/labels on dark (midnight) backgrounds.
  static const Color mutedOnDark = Color(0xFF93A0BE);

  // --- System feedback (kept muted/desaturated to match the editorial tone) ---

  /// Desaturated error tone — never a saturated red.
  static const Color error = Color(0xFFA9635B);

  /// Desaturated success tone — muted sage, not a bright green.
  static const Color success = Color(0xFF7C8F73);

  /// Packaging box gradient.
  static const LinearGradient boxGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [midnightGradientTop, midnightDeep],
  );

  /// Packaging bag gradient.
  static const LinearGradient bagGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [ivory, beige],
  );

  /// Ribbon gradient used on packaging box front.
  static const LinearGradient ribbonGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [goldSoft, gold],
  );
}
