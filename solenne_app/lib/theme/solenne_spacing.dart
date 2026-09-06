/// SOLENNE spacing scale.
///
/// The reference desktop HTML uses 70–90px vertical rhythm between major
/// sections. On mobile we keep the same *generous* feel, scaled down:
/// minimum ~32–48px between major sections, 16–24px between related elements.
class SolenneSpacing {
  SolenneSpacing._();

  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;

  /// Vertical rhythm between major page sections (Home, Shop, etc).
  static const double sectionGap = 48;

  /// Horizontal page padding used consistently across screens.
  static const double pageHorizontal = 20;
}
