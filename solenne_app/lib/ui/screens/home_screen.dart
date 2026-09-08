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
import '../../models/home_section_model.dart';
import '../../services/home_repository.dart';
import '../../core/utils/url_utils.dart';
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
child: FutureBuilder<List<HomeSectionModel>>(
    future: context.read<HomeRepository>().getHomeSections(),
    builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
            return const SolenneLoading();
        }
        final sections = snapshot.data ?? [];
        if (sections.isEmpty && snapshot.connectionState == ConnectionState.done) {
            return const Center(child: Text('No content published.'));
        }

        return ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: SolenneSpacing.lg),
            itemCount: sections.length + 1, // +1 for static footer sections if needed
            itemBuilder: (context, index) {
                if (index == sections.length) {
                    return Column(
                        children: [
                            _BrandStorySection(),
                            const SizedBox(height: SolenneSpacing.xxl),
                        ],
                    );
                }
                final section = sections[index];
                final num = (index + 1).toString().padLeft(2, '0');
                
                return _DynamicSection(section: section, num: num);
            },
        );
    },
),
),
),
);
}
}

class _DynamicSection extends StatelessWidget {
    final HomeSectionModel section;
    final String num;

    const _DynamicSection({required this.section, required this.num});

    @override
    Widget build(BuildContext context) {
        Widget content;
        
        switch (section.sectionType) {
            case 'hero':
                content = _HeroSection(section: section);
                break;
            case 'featured_collection':
                content = _FeaturedCollectionSection(section: section, num: num);
                break;
            case 'featured_products':
                content = _ProductGridSection(section: section, num: num);
                break;
            case 'editorial':
                content = _EditorialSection(section: section);
                break;
            case 'categories':
                content = _CategoriesSection(section: section, num: num);
                break;
            case 'banner':
                content = _BannerSection(section: section);
                break;
            case 'lookbook':
                content = _LookbookSection(section: section, num: num);
                break;
            default:
                return const SizedBox.shrink();
        }

        return Column(
            children: [
                content,
                const SizedBox(height: SolenneSpacing.sectionGap),
            ],
        );
    }
}

class _HeroSection extends StatelessWidget {
  final HomeSectionModel section;
  const _HeroSection({required this.section});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: SolenneSpacing.pageHorizontal),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (section.mediaUrl != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: UrlUtils.buildImage(section.mediaUrl!),
              ),
            ),
          const SizedBox(height: SolenneSpacing.lg),
          if (section.subtitle.isNotEmpty)
            Text(
              section.subtitle.toUpperCase(),
              style: SolenneTypography.eyebrow(),
            ),
          const SizedBox(height: SolenneSpacing.sm),
          Text(
            section.title,
            style: SolenneTypography.heading(fontSize: 30),
          ),
          if (section.description.isNotEmpty) ...[
            const SizedBox(height: SolenneSpacing.md),
            Text(
              section.description,
              style: SolenneTypography.editorialBody(
                fontSize: 17,
                color: SolenneColors.muted,
              ),
            ),
          ],
          if (section.buttonText != null && section.buttonText!.isNotEmpty) ...[
            const SizedBox(height: SolenneSpacing.lg),
            SolenneButton(
              label: section.buttonText!,
              fullWidth: false,
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ShopScreen()),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _FeaturedCollectionSection extends StatelessWidget {
  final HomeSectionModel section;
  final String num;
  const _FeaturedCollectionSection({required this.section, required this.num});

  @override
  Widget build(BuildContext context) {
    final collection = section.collection;
    final image = section.mediaUrl ?? collection?.image;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: SolenneSpacing.pageHorizontal),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SolenneSectionTitle(title: section.title.isNotEmpty ? section.title : 'Featured Collection', eyebrow: '$num — Curated'),
          const SizedBox(height: SolenneSpacing.lg),
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: SizedBox(
              width: double.infinity,
              height: 260,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (image != null) UrlUtils.buildImage(image),
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
                  Positioned(
                    left: SolenneSpacing.lg,
                    right: SolenneSpacing.lg,
                    bottom: SolenneSpacing.lg,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          collection?.name.toUpperCase() ?? 'COLLECTION',
                          style: SolenneTypography.eyebrow(color: SolenneColors.ivory),
                        ),
                        const SizedBox(height: SolenneSpacing.xs),
                        Text(
                          section.subtitle.isNotEmpty ? section.subtitle : collection?.name ?? 'Discover',
                          style: SolenneTypography.heading(fontSize: 22, color: SolenneColors.ivory),
                        ),
                        if (section.buttonText != null) ...[
                          const SizedBox(height: 6),
                          Text(
                            section.buttonText!,
                            style: SolenneTypography.caption(color: SolenneColors.goldSoft),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProductGridSection extends StatelessWidget {
  final HomeSectionModel section;
  final String num;
  const _ProductGridSection({required this.section, required this.num});

  @override
  Widget build(BuildContext context) {
    final wishlist = context.watch<WishlistState>();
    final products = section.products;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: SolenneSpacing.pageHorizontal),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SolenneSectionTitle(
            title: section.title.isNotEmpty ? section.title : 'Featured',
            eyebrow: '$num — Selected',
          ),
          const SizedBox(height: SolenneSpacing.lg),
          if (products.isEmpty)
            Text('Nothing here yet.', style: SolenneTypography.caption())
          else
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: products.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
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
                    MaterialPageRoute(builder: (_) => ProductDetailsScreen(productId: p.id)),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}

class _EditorialSection extends StatelessWidget {
  final HomeSectionModel section;
  const _EditorialSection({required this.section});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: SolenneColors.midnight,
      padding: const EdgeInsets.symmetric(horizontal: SolenneSpacing.pageHorizontal, vertical: SolenneSpacing.xxl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (section.mediaUrl != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: UrlUtils.buildImage(section.mediaUrl!),
            ),
            const SizedBox(height: SolenneSpacing.xl),
          ],
          if (section.subtitle.isNotEmpty)
            Text(
              section.subtitle.toUpperCase(),
              style: SolenneTypography.eyebrow(color: SolenneColors.goldSoft),
            ),
          const SizedBox(height: SolenneSpacing.md),
          Text(
            section.title,
            style: SolenneTypography.heading(fontSize: 26, color: SolenneColors.ivory),
          ),
          if (section.description.isNotEmpty) ...[
            const SizedBox(height: SolenneSpacing.lg),
            Text(
              section.description,
              style: SolenneTypography.editorialBody(fontSize: 18, color: SolenneColors.ivory.withOpacity(0.8)),
            ),
          ],
          if (section.buttonText != null && section.buttonText!.isNotEmpty) ...[
            const SizedBox(height: SolenneSpacing.xl),
            GestureDetector(
              onTap: () {},
              child: Text(
                '${section.buttonText!} →',
                style: SolenneTypography.label(color: SolenneColors.goldSoft),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _CategoriesSection extends StatelessWidget {
  final HomeSectionModel section;
  final String num;
  const _CategoriesSection({required this.section, required this.num});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: SolenneSpacing.pageHorizontal),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SolenneSectionTitle(title: section.title.isNotEmpty ? section.title : 'Categories', eyebrow: '$num — Collections'),
          const SizedBox(height: SolenneSpacing.lg),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: section.categories.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: SolenneSpacing.md,
              crossAxisSpacing: SolenneSpacing.md,
              childAspectRatio: 0.8,
            ),
            itemBuilder: (context, i) {
              final cat = section.categories[i];
              return GestureDetector(
                onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ShopScreen())),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: cat.image != null ? UrlUtils.buildImage(cat.image!) : Container(color: SolenneColors.ivoryWarm),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(cat.name.toUpperCase(), style: SolenneTypography.label(fontSize: 12)),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _BannerSection extends StatelessWidget {
  final HomeSectionModel section;
  const _BannerSection({required this.section});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(SolenneSpacing.xl),
      decoration: BoxDecoration(
        color: SolenneColors.ivoryWarm,
        border: Border.symmetric(horizontal: BorderSide(color: SolenneColors.line)),
      ),
      child: Column(
        children: [
          Text(section.title, style: SolenneTypography.heading(fontSize: 20)),
          if (section.description.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(section.description, style: SolenneTypography.body(color: SolenneColors.muted), textAlign: TextAlign.center),
          ],
          if (section.buttonText != null) ...[
            const SizedBox(height: 16),
            Text(section.buttonText!.toUpperCase(), style: SolenneTypography.label(color: SolenneColors.gold)),
          ],
        ],
      ),
    );
  }
}

class _LookbookSection extends StatelessWidget {
  final HomeSectionModel section;
  final String num;
  const _LookbookSection({required this.section, required this.num});

  @override
  Widget build(BuildContext context) {
    final images = section.gallery.isNotEmpty 
        ? section.gallery 
        : (section.mediaUrl != null ? [section.mediaUrl!] : <String>[]);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: SolenneSpacing.pageHorizontal),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SolenneSectionTitle(title: section.title.isNotEmpty ? section.title : 'Lookbook', eyebrow: '$num — Visuals'),
          const SizedBox(height: SolenneSpacing.lg),
          if (images.isEmpty)
             const SizedBox.shrink()
          else
            GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: images.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: SolenneSpacing.sm,
                crossAxisSpacing: SolenneSpacing.sm,
                childAspectRatio: 0.75,
                ),
                itemBuilder: (context, i) {
                    return UrlUtils.buildImage(images[i]);
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
