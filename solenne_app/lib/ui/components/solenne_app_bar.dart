import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/solenne_theme.dart';
import 'solenne_logo.dart';

/// SOLENNE app bar: horizontal logo lockup + search/account/cart icons only.
/// Cart shows an item-count badge.
class SolenneAppBar extends StatelessWidget implements PreferredSizeWidget {
  const SolenneAppBar({
    super.key,
    this.cartItemCount = 0,
    this.notificationCount = 0,
    this.onSearchTap,
    this.onAccountTap,
    this.onCartTap,
    this.onNotificationsTap,
  });

  final int cartItemCount;
  final int notificationCount;
  final VoidCallback? onSearchTap;
  final VoidCallback? onAccountTap;
  final VoidCallback? onCartTap;
  final VoidCallback? onNotificationsTap;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      titleSpacing: SolenneSpacing.pageHorizontal,
      title: const SolenneLogo(variant: SolenneLogoVariant.horizontal, iconSize: 24, wordmarkSize: 16),
      actions: [
        IconButton(
          icon: const Icon(LucideIcons.search, color: SolenneColors.midnight, size: 20),
          onPressed: onSearchTap,
        ),
        IconButton(
          icon: const Icon(LucideIcons.user, color: SolenneColors.midnight, size: 20),
          onPressed: onAccountTap,
        ),
        Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: const Icon(LucideIcons.bell, color: SolenneColors.midnight, size: 20),
              onPressed: onNotificationsTap,
            ),
            if (notificationCount > 0)
              Positioned(
                right: 6,
                top: 6,
                child: Container(
                  padding: const EdgeInsets.all(3),
                  decoration: const BoxDecoration(
                    color: SolenneColors.gold,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                  child: Text(
                    notificationCount > 9 ? '9+' : '$notificationCount',
                    textAlign: TextAlign.center,
                    style: SolenneTypography.caption(fontSize: 9, color: SolenneColors.midnight),
                  ),
                ),
              ),
          ],
        ),
        Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: const Icon(LucideIcons.shoppingBag, color: SolenneColors.midnight, size: 20),
              onPressed: onCartTap,
            ),
            if (cartItemCount > 0)
              Positioned(
                right: 6,
                top: 6,
                child: Container(
                  padding: const EdgeInsets.all(3),
                  decoration: const BoxDecoration(
                    color: SolenneColors.gold,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                  child: Text(
                    '$cartItemCount',
                    textAlign: TextAlign.center,
                    style: SolenneTypography.caption(fontSize: 9, color: SolenneColors.midnight),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(width: SolenneSpacing.sm),
      ],
    );
  }
}
