import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../components/solenne_bottom_nav.dart';
import '../../state/cart_state.dart';
import 'home_screen.dart';
import 'shop_screen.dart';
import 'wishlist_screen.dart';
import 'cart_screen.dart';
import 'account_screen.dart';

/// Hosts the SolenneBottomNav and swaps between the five primary tabs
/// without losing each tab's scroll/navigation state.
class RootShell extends StatefulWidget {
  const RootShell({super.key});

  @override
  State<RootShell> createState() => _RootShellState();
}

class _RootShellState extends State<RootShell> {
  int _index = 0;

  static const _screens = [
    HomeScreen(),
    ShopScreen(),
    WishlistScreen(),
    CartScreen(),
    AccountScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final cartItemCount = context.watch<CartState>().itemCount;

    return Scaffold(
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: SolenneBottomNav(
        currentIndex: _index,
        cartItemCount: cartItemCount,
        onTap: (i) => setState(() => _index = i),
      ),
    );
  }
}
