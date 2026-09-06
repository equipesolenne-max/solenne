import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/solenne_theme.dart';

/// Home · Shop · Wishlist · Cart · Account — thin line icons, selected
/// state in midnight/gold, no heavy colorful nav bar.
class SolenneBottomNav extends StatelessWidget {
  const SolenneBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.cartItemCount = 0,
  });

  final int currentIndex;
  final ValueChanged<int> onTap;
  final int cartItemCount;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: SolenneColors.ivory,
        border: Border(top: BorderSide(color: SolenneColors.line, width: 1)),
      ),
      child: SafeArea(
        child: SizedBox(
          height: 60,
          child: Row(
            children: [
              _item(0, LucideIcons.home, 'Home'),
              _item(1, LucideIcons.grid, 'Shop'),
              _item(2, LucideIcons.heart, 'Wishlist'),
              _item(3, LucideIcons.shoppingBag, 'Cart', badge: cartItemCount),
              _item(4, LucideIcons.user, 'Account'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _item(int index, IconData icon, String label, {int badge = 0}) {
    final selected = index == currentIndex;
    final color = selected ? SolenneColors.midnight : SolenneColors.muted;

    return Expanded(
      child: InkWell(
        onTap: () => onTap(index),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(icon, size: 20, color: selected ? SolenneColors.gold : color),
                if (badge > 0)
                  Positioned(
                    right: -6,
                    top: -4,
                    child: Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(color: SolenneColors.gold, shape: BoxShape.circle),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(label, style: SolenneTypography.caption(fontSize: 10, color: color)),
          ],
        ),
      ),
    );
  }
}
