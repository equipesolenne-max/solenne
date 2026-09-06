import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_product_card.dart';
import '../components/solenne_loading.dart';
import '../components/solenne_empty_state.dart';
import '../components/solenne_button.dart';
import '../../models/product_model.dart';
import '../../models/category_model.dart';
import '../../models/collection_model.dart';
import '../../services/product_repository.dart';
import '../../state/wishlist_state.dart';
import 'product_details_screen.dart';

/// Category & collection navigation, 2-column editorial product grid,
/// filters as a bottom sheet, sorting, search entry point.
class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  String? _category;
  String? _sort;
  RangeValues _priceRange = const RangeValues(0, 10000);
  
  List<CategoryModel> _categories = [];
  bool _isLoadingCategories = true;

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    final categories = await context.read<ProductRepository>().getCategories();
    if (mounted) {
      setState(() {
        _categories = categories;
        _isLoadingCategories = false;
      });
    }
  }

  void _openFilters() {
    showModalBottomSheet(
      context: context,
      backgroundColor: SolenneColors.ivory,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
      ),
      builder: (context) => _FilterBottomSheet(
        initialSort: _sort,
        initialPriceRange: _priceRange,
        onApply: (sort, range) {
          setState(() {
            _sort = sort;
            _priceRange = range;
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final wishlist = context.watch<WishlistState>();

    return Scaffold(
      appBar: AppBar(
        title: Text('SHOP', style: SolenneTypography.sectionTitle()),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.slidersHorizontal, color: SolenneColors.midnight, size: 20),
            onPressed: _openFilters,
          ),
        ],
      ),
      body: Column(
        children: [
          SizedBox(
            height: 44,
            child: _isLoadingCategories
                ? const Center(child: LinearProgressIndicator(minHeight: 1))
                : ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: SolenneSpacing.pageHorizontal),
                    itemCount: _categories.length + 1,
                    separatorBuilder: (_, __) => const SizedBox(width: SolenneSpacing.md),
                    itemBuilder: (context, i) {
                      final isAll = i == 0;
                      final cat = isAll ? null : _categories[i - 1];
                      final catName = isAll ? 'All' : cat!.name;
                      final catSlug = isAll ? null : cat!.slug;
                      
                      final selected = (isAll && _category == null) || _category == catSlug;
                      
                      return GestureDetector(
                        onTap: () => setState(() => _category = catSlug),
                        child: Center(
                          child: Text(
                            catName.toUpperCase(),
                            style: SolenneTypography.label(
                              color: selected ? SolenneColors.midnight : SolenneColors.muted,
                            ).copyWith(
                              decoration: selected ? TextDecoration.underline : TextDecoration.none,
                              decorationColor: SolenneColors.gold,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
          const Divider(height: 1),
          Expanded(
            child: StreamBuilder<List<ProductModel>>(
              stream: context.read<ProductRepository>().watchAll(
                category: _category,
                minPrice: _priceRange.start > 0 ? _priceRange.start : null,
                maxPrice: _priceRange.end < 10000 ? _priceRange.end : null,
                sort: _sort,
              ),
              builder: (context, snapshot) {
                if (snapshot.hasError) {
                  return const SolenneEmptyState(
                    title: 'Something went wrong',
                    message: 'We couldn’t fetch the collection. Please try again later.',
                    icon: LucideIcons.alertTriangle,
                  );
                }
                if (!snapshot.hasData) return const SolenneLoading();
                final products = snapshot.data!;
                if (products.isEmpty) {
                  return const SolenneEmptyState(
                    title: 'No pieces here yet',
                    message: 'Check back soon, or browse another category.',
                    icon: LucideIcons.search,
                  );
                }
                return GridView.builder(
                  padding: const EdgeInsets.all(SolenneSpacing.pageHorizontal),
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
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterBottomSheet extends StatefulWidget {
  const _FilterBottomSheet({
    this.initialSort,
    required this.initialPriceRange,
    required this.onApply,
  });

  final String? initialSort;
  final RangeValues initialPriceRange;
  final Function(String?, RangeValues) onApply;

  @override
  State<_FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<_FilterBottomSheet> {
  String? _selectedSort;
  late RangeValues _currentRange;

  @override
  void initState() {
    super.initState();
    _selectedSort = widget.initialSort;
    _currentRange = widget.initialPriceRange;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        SolenneSpacing.lg,
        SolenneSpacing.lg,
        SolenneSpacing.lg,
        MediaQuery.of(context).padding.bottom + SolenneSpacing.lg,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('FILTER & SORT', style: SolenneTypography.sectionTitle()),
              IconButton(
                icon: const Icon(LucideIcons.x, size: 20),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: SolenneSpacing.lg),
          Text('SORT BY', style: SolenneTypography.label()),
          const SizedBox(height: SolenneSpacing.sm),
          _buildSortOption('newest', 'Newest Arrivals'),
          _buildSortOption('price_low', 'Price: Low to High'),
          _buildSortOption('price_high', 'Price: High to Low'),
          const SizedBox(height: SolenneSpacing.xl),
          Text('PRICE RANGE', style: SolenneTypography.label()),
          const SizedBox(height: SolenneSpacing.sm),
          RangeSlider(
            values: _currentRange,
            min: 0,
            max: 10000,
            divisions: 20,
            activeColor: SolenneColors.gold,
            inactiveColor: SolenneColors.line,
            labels: RangeLabels(
              '${_currentRange.start.toInt()} DZD',
              '${_currentRange.end.toInt()} DZD',
            ),
            onChanged: (values) => setState(() => _currentRange = values),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${_currentRange.start.toInt()} DZD', style: SolenneTypography.caption()),
                Text('${_currentRange.end.toInt()} DZD', style: SolenneTypography.caption()),
              ],
            ),
          ),
          const SizedBox(height: SolenneSpacing.xxl),
          SolenneButton(
            label: 'Apply Filters',
            onPressed: () {
              widget.onApply(_selectedSort, _currentRange);
              Navigator.pop(context);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSortOption(String value, String label) {
    final isSelected = _selectedSort == value;
    return InkWell(
      onTap: () => setState(() => _selectedSort = value),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: SolenneSpacing.sm),
        child: Row(
          children: [
            Container(
              width: 18,
              height: 18,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? SolenneColors.gold : SolenneColors.line,
                  width: isSelected ? 5 : 1,
                ),
              ),
            ),
            const SizedBox(width: SolenneSpacing.md),
            Text(
              label,
              style: SolenneTypography.body(
                color: isSelected ? SolenneColors.midnight : SolenneColors.muted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
