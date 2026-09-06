import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/solenne_theme.dart';
import '../../state/auth_state.dart';
import 'auth_screen.dart';
import 'orders_screen.dart';
import 'addresses_screen.dart';
import 'wishlist_screen.dart';
import 'notifications_screen.dart';
import 'inquiries_screen.dart';

/// Redesigned Account / Profile screen: editorial header, sectioned menu items,
/// and a refined logout action with smooth staggered animations.
class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();

    if (!auth.isSignedIn) {
      return const AuthScreen();
    }

    final user = auth.user!;

    return Scaffold(
      backgroundColor: SolenneColors.ivory,
      appBar: AppBar(
        title: Text('PROFILE', style: SolenneTypography.sectionTitle()),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: SolenneSpacing.pageHorizontal),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: SolenneSpacing.lg),
              _StaggeredFadeIn(
                delay: 0,
                child: _ProfileHeader(
                  name: user.name.isNotEmpty ? user.name : 'Solenne Member',
                  email: user.email,
                ),
              ),
              const SizedBox(height: SolenneSpacing.xxl),

              _StaggeredFadeIn(
                delay: 100,
                child: _AccountSection(
                  title: 'MY ACCOUNT',
                  items: [
                    _AccountMenuItem(
                      icon: LucideIcons.mapPin,
                      title: 'Addresses',
                      subtitle: 'Manage your shipping locations',
                      onTap: () => _navigate(context, const AddressesScreen()),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: SolenneSpacing.xl),

              _StaggeredFadeIn(
                delay: 200,
                child: _AccountSection(
                  title: 'MY ACTIVITY',
                  items: [
                    _AccountMenuItem(
                      icon: LucideIcons.package,
                      title: 'My Orders',
                      subtitle: 'Track and view order history',
                      onTap: () => _navigate(context, const OrdersScreen()),
                    ),
                    _AccountMenuItem(
                      icon: LucideIcons.heart,
                      title: 'Favorites',
                      subtitle: 'Your curated silk wishlist',
                      onTap: () => _navigate(context, const WishlistScreen()),
                    ),
                    _AccountMenuItem(
                      icon: LucideIcons.bell,
                      title: 'Notifications',
                      subtitle: 'Updates on arrivals and orders',
                      onTap: () => _navigate(context, const NotificationsScreen()),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: SolenneSpacing.xl),

              _StaggeredFadeIn(
                delay: 300,
                child: _AccountSection(
                  title: 'SUPPORT',
                  items: [
                    _AccountMenuItem(
                      icon: LucideIcons.messageCircle,
                      title: 'Contact Us',
                      subtitle: 'Get help with your inquiries',
                      onTap: () => _navigate(context, const InquiriesScreen()),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: SolenneSpacing.xxl),

              _StaggeredFadeIn(
                delay: 400,
                child: Center(
                  child: TextButton(
                    onPressed: () => _showLogoutDialog(context),
                    style: TextButton.styleFrom(
                      foregroundColor: SolenneColors.error.withOpacity(0.8),
                      padding: const EdgeInsets.symmetric(
                        horizontal: SolenneSpacing.xl,
                        vertical: SolenneSpacing.md,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(LucideIcons.logOut, size: 16),
                        const SizedBox(width: SolenneSpacing.sm),
                        Text(
                          'LOGOUT',
                          style: SolenneTypography.button(
                            color: SolenneColors.error.withOpacity(0.8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: SolenneSpacing.xxl),
            ],
          ),
        ),
      ),
    );
  }

  void _navigate(BuildContext context, Widget screen) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: SolenneColors.ivory,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: SolenneBorders.borderRadius),
        title: Text('Logout', style: SolenneTypography.heading(fontSize: 20)),
        content: Text(
          'Are you sure you want to sign out of your account?',
          style: SolenneTypography.body(),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('CANCEL', style: SolenneTypography.button(color: SolenneColors.muted)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<AuthState>().signOut();
            },
            child: Text('LOGOUT', style: SolenneTypography.button(color: SolenneColors.error)),
          ),
        ],
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({required this.name, required this.email});
  final String name;
  final String email;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: SolenneColors.midnight,
            borderRadius: SolenneBorders.borderRadius,
          ),
          alignment: Alignment.center,
          child: Text(
            name.isNotEmpty ? name[0].toUpperCase() : 'S',
            style: SolenneTypography.wordmark(fontSize: 32, color: SolenneColors.ivory),
          ),
        ),
        const SizedBox(width: SolenneSpacing.lg),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: SolenneTypography.heading(fontSize: 22)),
              const SizedBox(height: 4),
              Text(email, style: SolenneTypography.body(color: SolenneColors.muted)),
            ],
          ),
        ),
      ],
    );
  }
}

class _AccountSection extends StatelessWidget {
  const _AccountSection({required this.title, required this.items});
  final String title;
  final List<Widget> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: SolenneSpacing.sm),
          child: Text(title, style: SolenneTypography.eyebrow()),
        ),
        Container(
          decoration: BoxDecoration(
            color: SolenneColors.ivoryWarm,
            border: Border.all(color: SolenneColors.line),
            borderRadius: SolenneBorders.borderRadius,
          ),
          child: Column(
            children: items,
          ),
        ),
      ],
    );
  }
}

class _AccountMenuItem extends StatelessWidget {
  const _AccountMenuItem({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: SolenneBorders.borderRadius,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: SolenneSpacing.md, vertical: SolenneSpacing.md),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(SolenneSpacing.sm),
              decoration: BoxDecoration(
                color: SolenneColors.ivory,
                borderRadius: SolenneBorders.borderRadius,
              ),
              child: Icon(icon, size: 20, color: SolenneColors.midnight),
            ),
            const SizedBox(width: SolenneSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: SolenneTypography.body().copyWith(fontWeight: FontWeight.w500),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(subtitle!, style: SolenneTypography.caption()),
                  ],
                ],
              ),
            ),
            const Icon(LucideIcons.chevronRight, size: 16, color: SolenneColors.line),
          ],
        ),
      ),
    );
  }
}

class _StaggeredFadeIn extends StatefulWidget {
  const _StaggeredFadeIn({required this.child, required this.delay});
  final Widget child;
  final int delay;

  @override
  State<_StaggeredFadeIn> createState() => _StaggeredFadeInState();
}

class _StaggeredFadeInState extends State<_StaggeredFadeIn> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacity;
  late Animation<Offset> _offset;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _opacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 1.0, curve: Curves.easeOut),
      ),
    );

    _offset = Tween<Offset>(begin: const Offset(0, 0.05), end: Offset.zero).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 1.0, curve: Curves.easeOut),
      ),
    );

    Future.delayed(Duration(milliseconds: widget.delay), () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _opacity,
      child: SlideTransition(
        position: _offset,
        child: widget.child,
      ),
    );
  }
}
