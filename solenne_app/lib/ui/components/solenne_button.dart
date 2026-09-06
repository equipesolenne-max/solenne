import 'package:flutter/material.dart';
import '../../theme/solenne_theme.dart';

enum SolenneButtonVariant { primary, secondary }

/// Flat, uppercase-label button in the SOLENNE identity.
/// e.g. SolenneButton(label: 'ADD TO BAG', onPressed: ...)
class SolenneButton extends StatelessWidget {
  const SolenneButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = SolenneButtonVariant.primary,
    this.fullWidth = true,
    this.loading = false,
    this.leadingIcon,
  });

  final String label;
  final VoidCallback? onPressed;
  final SolenneButtonVariant variant;
  final bool fullWidth;
  final bool loading;
  final IconData? leadingIcon;

  @override
  Widget build(BuildContext context) {
    final isPrimary = variant == SolenneButtonVariant.primary;

    final child = loading
        ? SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: isPrimary ? SolenneColors.ivory : SolenneColors.midnight,
            ),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (leadingIcon != null) ...[
                Icon(leadingIcon, size: 16,
                    color: isPrimary ? SolenneColors.ivory : SolenneColors.midnight),
                const SizedBox(width: SolenneSpacing.sm),
              ],
              Text(label.toUpperCase()),
            ],
          );

    final button = isPrimary
        ? ElevatedButton(
            style: SolenneTheme.primaryButtonStyle,
            onPressed: loading ? null : onPressed,
            child: child,
          )
        : OutlinedButton(
            style: SolenneTheme.secondaryButtonStyle,
            onPressed: loading ? null : onPressed,
            child: child,
          );

    return fullWidth ? SizedBox(width: double.infinity, child: button) : button;
  }
}
