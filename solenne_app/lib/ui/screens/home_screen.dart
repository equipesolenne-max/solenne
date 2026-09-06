import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_app_bar.dart';
import '../components/solenne_section_title.dart';
import '../components/solenne_product_card.dart';
import '../components/solenne_loading.dart';
import '../components/solenne_button.dart';
import '../../models/product_model.dart';
import '../../services/product_repository.dart';
import '../../state/cart_state.dart';
import '../../state/wishlist_state.dart';
import '../../state/notification_state.dart';
import 'product_details_screen.dart';
import 'shop_screen.dart';
import 'search_screen.dart';
import 'account_screen.dart';
import 'cart_screen.dart';
import 'notifications_screen.dart';

/// Minimal header -> hero/editorial intro -> featured collection ->
/// featured products -> new arrivals -> brand storytelling.
class HomeScreen extends StatelessWidget {
const HomeScreen({super.key});

@override
Widget build(BuildContext context) {
final cart = context.watch<CartState>();
final notifications = context.watch<NotificationState>();

return Scaffold(
appBar: SolenneAppBar(
cartItemCount: cart.itemCount,
notificationCount: notifications.unreadCount,
onSearchTap: () => Navigator.of(context).push(
MaterialPageRoute(
builder: (_) => const SearchScreen(),
),
),
onAccountTap: () => Navigator.of(context).push(
MaterialPageRoute(
builder: (_) => const AccountScreen(),
),
),
onCartTap: () => Navigator.of(context).push(
MaterialPageRoute(
builder: (_) => const CartScreen(),
),
),
onNotificationsTap: () => Navigator.of(context).push(
MaterialPageRoute(
builder: (_) => const NotificationsScreen(),
),
),
),
body: SafeArea(
child: RefreshIndicator(
onRefresh: () async {
await Future.wait([
context.read<CartState>().fetchCart(),
context.read<NotificationState>().fetchNotifications(),
]);
},
color: SolenneColors.midnight,
child: ListView(
padding: const EdgeInsets.symmetric(
vertical: SolenneSpacing.lg,
),
children: [
_HeroSection(),

const SizedBox(
height: SolenneSpacing.sectionGap,
),

_FeaturedCollectionSection(),

const SizedBox(
height: SolenneSpacing.sectionGap,
),

_ProductGridSection(
title: 'Featured',
eyebrow: '01 — Curated',
stream: context
    .read<ProductRepository>()
    .watchAll(),
),

const SizedBox(
height: SolenneSpacing.sectionGap,
),

_ProductGridSection(
title: 'New Arrivals',
eyebrow: '02 — Just In',
stream: context
    .read<ProductRepository>()
    .watchNewArrivals(),
),

const SizedBox(
height: SolenneSpacing.sectionGap,
),

_BrandStorySection(),

const SizedBox(
height: SolenneSpacing.xxl,
),
],
),
),
),
);
}
}

class _HeroSection extends StatelessWidget {
@override
Widget build(BuildContext context) {
return Padding(
padding: const EdgeInsets.symmetric(
horizontal: SolenneSpacing.pageHorizontal,
),
child: Column(
crossAxisAlignment: CrossAxisAlignment.start,
children: [
Text(
'QUIET LUXURY',
style: SolenneTypography.eyebrow(),
),

const SizedBox(
height: SolenneSpacing.sm,
),

Text(
'For the modern\nhijab wardrobe.',
style: SolenneTypography.heading(
fontSize: 30,
),
),

const SizedBox(
height: SolenneSpacing.md,
),

Text(
'Silk pieces cut for stillness — designed in Paris, worn everywhere.',
style: SolenneTypography.editorialBody(
fontSize: 17,
color: SolenneColors.muted,
),
),

const SizedBox(
height: SolenneSpacing.lg,
),

SolenneButton(
label: 'Shop the collection',
fullWidth: false,
onPressed: () => Navigator.of(context).push(
MaterialPageRoute(
builder: (_) => const ShopScreen(),
),
),
),
],
),
);
}
}

class _FeaturedCollectionSection extends StatelessWidget {
@override
Widget build(BuildContext context) {
return Padding(
padding: const EdgeInsets.symmetric(
horizontal: SolenneSpacing.pageHorizontal,
),
child: ClipRRect(
borderRadius: BorderRadius.circular(16),
child: SizedBox(
width: double.infinity,
height: 260,
child: Stack(
fit: StackFit.expand,
children: [
// Autumn Collection image
Image.asset(
'assets/collection.png',
fit: BoxFit.cover,
),

// Elegant midnight-blue gradient overlay
Container(
decoration: BoxDecoration(
gradient: LinearGradient(
begin: Alignment.topCenter,
end: Alignment.bottomCenter,
colors: [
Colors.transparent,
SolenneColors.midnight.withOpacity(0.75),
],
),
),
),

// Collection information
Positioned(
left: SolenneSpacing.lg,
right: SolenneSpacing.lg,
bottom: SolenneSpacing.lg,
child: Column(
crossAxisAlignment: CrossAxisAlignment.start,
children: [
Text(
'THE ATELIER EDIT',
style: SolenneTypography.eyebrow(
color: SolenneColors.ivory,
),
),

const SizedBox(
height: SolenneSpacing.xs,
),

Text(
'Autumn Collection',
style: SolenneTypography.heading(
fontSize: 22,
color: SolenneColors.ivory,
),
),

const SizedBox(
height: 6,
),

Text(
'Discover the season',
style: SolenneTypography.caption(
color: SolenneColors.goldSoft,
),
),
],
),
),
],
),
),
),
);
}
}

class _ProductGridSection extends StatelessWidget {
const _ProductGridSection({
required this.title,
required this.eyebrow,
required this.stream,
});

final String title;
final String eyebrow;
final Stream<List<ProductModel>> stream;

@override
Widget build(BuildContext context) {
final wishlist = context.watch<WishlistState>();
final cart = context.read<CartState>();

return Padding(
padding: const EdgeInsets.symmetric(
horizontal: SolenneSpacing.pageHorizontal,
),
child: Column(
crossAxisAlignment: CrossAxisAlignment.start,
children: [
SolenneSectionTitle(
title: title,
eyebrow: eyebrow,
),

const SizedBox(
height: SolenneSpacing.lg,
),

StreamBuilder<List<ProductModel>>(
stream: stream,
builder: (context, snapshot) {
if (snapshot.hasError) {
return Padding(
padding: const EdgeInsets.symmetric(
vertical: SolenneSpacing.xl,
),
child: Center(
child: Text(
'Failed to load. Swipe down to retry.',
style: SolenneTypography.caption(),
),
),
);
}

if (!snapshot.hasData) {
return const Padding(
padding: EdgeInsets.symmetric(
vertical: SolenneSpacing.xl,
),
child: SolenneLoading(),
);
}

final products = snapshot.data!
    .take(4)
    .toList();

if (products.isEmpty) {
return Text(
'Nothing here yet.',
style: SolenneTypography.caption(),
);
}

return GridView.builder(
shrinkWrap: true,
physics: const NeverScrollableScrollPhysics(),
itemCount: products.length,
gridDelegate:
const SliverGridDelegateWithFixedCrossAxisCount(
crossAxisCount: 2,
mainAxisSpacing: SolenneSpacing.lg,
crossAxisSpacing: SolenneSpacing.md,
childAspectRatio: 0.62,
),
itemBuilder: (context, i) {
final p = products[i];

return SolenneProductCard(
product: p,
isWishlisted: wishlist.isWishlisted(p.id),
onWishlistTap: () => wishlist.toggle(p.id),
onTap: () => Navigator.of(context).push(
MaterialPageRoute(
builder: (_) => ProductDetailsScreen(
productId: p.id,
),
),
),
);
},
);
},
),
],
),
);
}
}

class _BrandStorySection extends StatelessWidget {
@override
Widget build(BuildContext context) {
return Container(
width: double.infinity,
color: SolenneColors.midnight,
padding: const EdgeInsets.symmetric(
horizontal: SolenneSpacing.pageHorizontal,
vertical: SolenneSpacing.xxl,
),
child: Column(
crossAxisAlignment: CrossAxisAlignment.start,
children: [
Text(
'THE HOUSE',
style: SolenneTypography.eyebrow(
color: SolenneColors.goldSoft,
),
),

const SizedBox(
height: SolenneSpacing.md,
),

Text(
'Every piece arrives as it should — considered, quiet, and wrapped with care.',
style: SolenneTypography.editorialBody(
fontSize: 19,
color: SolenneColors.ivory,
),
),

const SizedBox(
height: SolenneSpacing.xl,
),

// Packaging imagery
Container(
height: 160,
width: double.infinity,
decoration: BoxDecoration(
gradient: SolenneColors.boxGradient,
boxShadow: SolenneBorders.packagingShadow,
),
alignment: Alignment.center,
child: Column(
mainAxisSize: MainAxisSize.min,
children: [
Text(
'SOLENNE',
style: SolenneTypography.wordmark(
fontSize: 20,
color: SolenneColors.ivory,
),
),

const SizedBox(
height: 4,
),

Text(
'Silk hijab collection',
style: SolenneTypography.tagline(
color: SolenneColors.goldSoft,
),
),
],
),
),
],
),
);
}
}
