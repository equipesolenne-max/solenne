import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/solenne_theme.dart';
import 'solenne_button.dart';

/// Calm, editorial empty/error state — used for empty cart, empty wishlist,
/// no orders yet, no search results, and generic error fallback.
class SolenneEmptyState extends StatelessWidget {
  const SolenneEmptyState({
    super.key,
    required this.title,
    this.message,
    this.icon = LucideIcons.package,
    this.actionLabel,
    this.onAction,
  });

  final String title;
  final String? message;
  final IconData icon;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(SolenneSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 40, color: SolenneColors.muted),
            const SizedBox(height: SolenneSpacing.lg),
            Text(title, style: SolenneTypography.heading(fontSize: 18), textAlign: TextAlign.center),
            if (message != null) ...[
              const SizedBox(height: SolenneSpacing.sm),
              Text(
                message!,
                style: SolenneTypography.editorialBody(fontSize: 15, color: SolenneColors.muted),
                textAlign: TextAlign.center,
              ),
            ],
            if (actionLabel != null) ...[
              const SizedBox(height: SolenneSpacing.lg),
              SolenneButton(
                label: actionLabel!,
                variant: SolenneButtonVariant.secondary,
                fullWidth: false,
                onPressed: onAction,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
