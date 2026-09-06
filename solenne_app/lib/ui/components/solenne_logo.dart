import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../theme/solenne_theme.dart';

/// Which lockup of the SOLENNE mark to render.
enum SolenneLogoVariant {
  /// Icon (large) above wordmark above tagline. Splash / brand-story use.
  primary,

  /// Icon — thin vertical divider — wordmark (smaller). Compact header use.
  horizontal,

  /// Just the line-mark icon, no wordmark.
  iconOnly,

  /// The circular monogram mark (app icon / favicon-style use).
  monogram,
}

/// Renders the exact SOLENNE brand marks. Do not approximate with a
/// different icon — this widget is the single source of truth for the logo.
class SolenneLogo extends StatelessWidget {
  const SolenneLogo({
    super.key,
    this.variant = SolenneLogoVariant.horizontal,
    this.dark = false,
    this.iconSize = 32,
    this.wordmarkSize = 20,
    this.showTagline = false,
  });

  final SolenneLogoVariant variant;

  /// Whether this logo sits on a dark (midnight) background.
  final bool dark;

  final double iconSize;
  final double wordmarkSize;

  /// Only relevant for [SolenneLogoVariant.primary].
  final bool showTagline;

  Color get _fg => dark ? SolenneColors.ivory : SolenneColors.midnight;
  Color get _taglineColor => dark ? SolenneColors.goldSoft : SolenneColors.gold;

  String get _iconAsset =>
      dark ? 'assets/brand/icon_dark.svg' : 'assets/brand/icon_light.svg';

  String get _monogramAsset => dark
      ? 'assets/brand/monogram_dark.svg'
      : 'assets/brand/monogram_light.svg';

  Widget _icon(double size) => SvgPicture.asset(_iconAsset, width: size, height: size);

  Widget _wordmark() => Text('SOLENNE', style: SolenneTypography.wordmark(fontSize: wordmarkSize, color: _fg));

  Widget _tagline() => Text('PARIS · SINCE 2026', style: SolenneTypography.tagline(color: _taglineColor));

  @override
  Widget build(BuildContext context) {
    switch (variant) {
      case SolenneLogoVariant.iconOnly:
        return _icon(iconSize);

      case SolenneLogoVariant.monogram:
        return SvgPicture.asset(_monogramAsset, width: iconSize, height: iconSize);

      case SolenneLogoVariant.horizontal:
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _icon(iconSize),
            const SizedBox(width: SolenneSpacing.sm),
            Container(width: 1, height: iconSize * 0.6, color: SolenneColors.line),
            const SizedBox(width: SolenneSpacing.sm),
            _wordmark(),
          ],
        );

      case SolenneLogoVariant.primary:
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _icon(iconSize),
            const SizedBox(height: SolenneSpacing.md),
            _wordmark(),
            if (showTagline) ...[
              const SizedBox(height: SolenneSpacing.xs),
              _tagline(),
            ],
          ],
        );
    }
  }
}
