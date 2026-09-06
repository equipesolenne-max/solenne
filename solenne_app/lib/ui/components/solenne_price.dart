import 'package:flutter/material.dart';
import '../../theme/solenne_theme.dart';

/// Displays a price in Jost medium, with an optional struck-through
/// compare-at price for discounted items.
class SolennePrice extends StatelessWidget {
  const SolennePrice({
    super.key,
    required this.amount,
    this.compareAtAmount,
    this.currencySymbol = 'DA',
    this.fontSize = 15,
    this.color,
  });

  final double amount;
  final double? compareAtAmount;
  final String currencySymbol;
  final double fontSize;
  final Color? color;

  String _format(double v) => '${v.toStringAsFixed(0)} $currencySymbol';

  @override
  Widget build(BuildContext context) {
    final hasDiscount = compareAtAmount != null && compareAtAmount! > amount;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          _format(amount),
          style: SolenneTypography.price(
            fontSize: fontSize,
            color: color ?? SolenneColors.midnight,
          ),
        ),
        if (hasDiscount) ...[
          const SizedBox(width: SolenneSpacing.sm),
          Text(
            _format(compareAtAmount!),
            style: SolenneTypography.price(fontSize: fontSize - 2, color: SolenneColors.muted)
                .copyWith(decoration: TextDecoration.lineThrough),
          ),
        ],
      ],
    );
  }
}
