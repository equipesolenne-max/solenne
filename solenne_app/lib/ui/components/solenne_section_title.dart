import 'package:flutter/material.dart';
import '../../theme/solenne_theme.dart';

/// Matches the identity page's section-label pattern:
/// an optional numbered/eyebrow line, the Marcellus title, and a thin
/// horizontal rule filling the remaining width.
class SolenneSectionTitle extends StatelessWidget {
  const SolenneSectionTitle({
    super.key,
    required this.title,
    this.eyebrow,
    this.dark = false,
  });

  /// e.g. "01 — FEATURED" or "NEW ARRIVALS"
  final String? eyebrow;
  final String title;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    final titleColor = dark ? SolenneColors.ivory : SolenneColors.midnight;
    final lineColor = dark ? SolenneColors.mutedOnDark.withOpacity(0.3) : SolenneColors.line;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (eyebrow != null) ...[
          Text(eyebrow!.toUpperCase(),
              style: SolenneTypography.eyebrow(
                  color: dark ? SolenneColors.goldSoft : SolenneColors.gold)),
          const SizedBox(height: SolenneSpacing.sm),
        ],
        Row(
          children: [
            Text(title.toUpperCase(), style: SolenneTypography.sectionTitle(color: titleColor)),
            const SizedBox(width: SolenneSpacing.md),
            Expanded(child: Divider(color: lineColor, thickness: 1, height: 1)),
          ],
        ),
      ],
    );
  }
}
