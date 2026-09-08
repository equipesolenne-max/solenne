import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_price.dart';
import '../components/solenne_button.dart';
import '../components/solenne_loading.dart';
import '../components/solenne_product_card.dart';
import '../../models/product_model.dart';
import '../../services/product_repository.dart';
import '../../state/cart_state.dart';
import '../../state/wishlist_state.dart';
import '../../core/utils/url_utils.dart';

class ProductDetailsScreen extends StatefulWidget {
  const ProductDetailsScreen({super.key, required this.productId});

  final String productId;

  @override
  State<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends State<ProductDetailsScreen> {
  final ScrollController _scrollController = ScrollController();
  final PageController _pageController = PageController();
  
  int _galleryIndex = 0;
  String? _selectedColorName;
  String? _selectedSize;
  int _quantity = 1;
  bool _showStickyBar = false;
  bool _isAddingToCart = false;

  ProductModel? _product;
  List<ProductModel> _relatedProducts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
    _scrollController.addListener(_handleScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  void _handleScroll() {
    if (_scrollController.offset > 500 && !_showStickyBar) {
      setState(() => _showStickyBar = true);
    } else if (_scrollController.offset <= 500 && _showStickyBar) {
      setState(() => _showStickyBar = false);
    }
  }

  Future<void> _loadData() async {
    final repo = context.read<ProductRepository>();
    final product = await repo.getById(widget.productId);
    
    if (product != null) {
      // Get related products (same category)
      final all = await repo.getAll(category: product.category);
      if (mounted) {
        setState(() {
          _product = product;
          _relatedProducts = all.where((p) => p.id != product.id).take(6).toList();
          if (product.variants.isNotEmpty) {
            _selectedColorName = product.variants.first.name;
          }
          _isLoading = false;
        });
      }
    } else {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  ProductVariantModel? get _currentVariant {
    if (_product == null || _selectedColorName == null) return null;
    return _product!.variants.firstWhere(
      (v) => v.name == _selectedColorName && (v.size == null || v.size == _selectedSize),
      orElse: () => _product!.variants.firstWhere((v) => v.name == _selectedColorName),
    );
  }

  List<String> get _activeImages {
    final variant = _currentVariant;
    if (variant != null && variant.images.isNotEmpty) return variant.images;
    return _product?.images ?? [];
  }

  double get _displayPrice {
    return _currentVariant?.price ?? _product?.price ?? 0;
  }

  double? get _comparePrice {
    return _currentVariant?.compareAtPrice ?? _product?.compareAtPrice;
  }

  int get _maxStock {
    return _currentVariant?.stock ?? (_product?.inStock == true ? 99 : 0);
  }

  void _addToCart() async {
    if (_product == null || _isAddingToCart) return;
    
    // Size validation
    final hasSizes = _product!.variants.any((v) => v.size != null && v.name == _selectedColorName);
    if (hasSizes && _selectedSize == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez sélectionner une taille')),
      );
      return;
    }

    setState(() => _isAddingToCart = true);
    
    try {
      await context.read<CartState>().add(
        _product!,
        variant: _currentVariant,
        quantity: _quantity,
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: SolenneColors.midnight,
            content: Text('Ajouté au panier ✓'),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erreur lors de l\'ajout au panier')),
        );
      }
    } finally {
      if (mounted) setState(() => _isAddingToCart = false);
    }
  }

  void _openFullscreenGallery() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => FullscreenGallery(
          images: _activeImages,
          initialIndex: _galleryIndex,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const SolenneLoading();
    if (_product == null) return const Scaffold(body: Center(child: Text('Product not found')));

    final product = _product!;
    final wishlist = context.watch<WishlistState>();
    final isWishlisted = wishlist.isWishlisted(product.id);
    
    // Group variants by color
    final colorMap = <String, ProductVariantModel>{};
    for (var v in product.variants) {
      if (!colorMap.containsKey(v.name)) colorMap[v.name] = v;
    }
    final colorNames = colorMap.keys.toList();
    
    // Available sizes for selected color
    final availableSizes = product.variants
        .where((v) => v.name == _selectedColorName && v.size != null)
        .map((v) => v.size!)
        .toList();

    return Scaffold(
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              // Premium Gallery Sliver
              SliverAppBar(
                expandedHeight: MediaQuery.of(context).size.width * 1.25,
                pinned: true,
                stretch: true,
                backgroundColor: Colors.transparent,
                surfaceTintColor: Colors.transparent,
                elevation: 0,
                leading: const BackButton(color: SolenneColors.midnight),
                actions: [
                  IconButton(
                    icon: Icon(
                      isWishlisted ? LucideIcons.heart : LucideIcons.heart,
                      color: isWishlisted ? SolenneColors.gold : SolenneColors.midnight,
                      fill: isWishlisted ? 1 : 0,
                    ),
                    onPressed: () => wishlist.toggle(product.id),
                  ),
                  const SizedBox(width: 8),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  stretchModes: const [StretchMode.zoomBackground],
                  background: GestureDetector(
                    onTap: _openFullscreenGallery,
                    child: Stack(
                      children: [
                        PageView.builder(
                          controller: _pageController,
                          itemCount: _activeImages.length,
                          onPageChanged: (i) => setState(() => _galleryIndex = i),
                          itemBuilder: (context, i) => UrlUtils.buildImage(
                            _activeImages[i],
                            fit: BoxFit.cover,
                          ),
                        ),
                        // Page Indicator
                        if (_activeImages.length > 1)
                          Positioned(
                            bottom: 24,
                            left: 0,
                            right: 0,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(_activeImages.length, (i) {
                                final active = i == _galleryIndex;
                                return AnimatedContainer(
                                  duration: const Duration(milliseconds: 300),
                                  margin: const EdgeInsets.symmetric(horizontal: 4),
                                  width: active ? 20 : 6,
                                  height: 6,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(3),
                                    color: active ? SolenneColors.midnight : SolenneColors.midnight.withOpacity(0.2),
                                  ),
                                );
                              }),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),

              // Product Info
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 32, 24, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  product.collection.toUpperCase(),
                                  style: SolenneTypography.eyebrow(color: SolenneColors.gold),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  product.name,
                                  style: SolenneTypography.heading(fontSize: 28),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SolennePrice(
                        amount: _displayPrice,
                        compareAtAmount: _comparePrice,
                        fontSize: 20,
                      ),
                      const SizedBox(height: 32),
                      
                      // Description
                      Text(
                        product.description,
                        style: SolenneTypography.editorialBody(),
                      ),
                      const SizedBox(height: 40),

                      // Color Selector
                      if (colorNames.length > 1) ...[
                        _buildSectionHeader('COULEUR', _selectedColorName),
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 16,
                          runSpacing: 16,
                          children: colorNames.map((name) {
                            final variant = colorMap[name]!;
                            final isSelected = _selectedColorName == name;
                            return GestureDetector(
                              onTap: () => setState(() {
                                _selectedColorName = name;
                                _selectedSize = null;
                                _galleryIndex = 0;
                                if (_activeImages.isNotEmpty) {
                                  _pageController.jumpToPage(0);
                                }
                              }),
                              child: Container(
                                width: 44,
                                height: 44,
                                padding: const EdgeInsets.all(3),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: isSelected ? SolenneColors.midnight : Colors.transparent,
                                    width: 1.5,
                                  ),
                                ),
                                child: Container(
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: _parseColor(variant.hex),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.05),
                                        blurRadius: 4,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 32),
                      ],

                      // Size Selector
                      if (availableSizes.isNotEmpty) ...[
                        _buildSectionHeader('TAILLE', _selectedSize),
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 12,
                          runSpacing: 12,
                          children: availableSizes.map((size) {
                            final isSelected = _selectedSize == size;
                            final variant = product.variants.firstWhere(
                              (v) => v.name == _selectedColorName && v.size == size
                            );
                            final isOutOfStock = variant.stock <= 0;
                            
                            return GestureDetector(
                              onTap: isOutOfStock ? null : () => setState(() => _selectedSize = size),
                              child: Container(
                                constraints: const BoxConstraints(minWidth: 60),
                                height: 48,
                                alignment: Alignment.center,
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                decoration: BoxDecoration(
                                  color: isSelected ? SolenneColors.midnight : Colors.transparent,
                                  border: Border.all(
                                    color: isSelected ? SolenneColors.midnight : SolenneColors.line,
                                  ),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  size,
                                  style: SolenneTypography.body(
                                    color: isSelected 
                                      ? SolenneColors.ivory 
                                      : (isOutOfStock ? SolenneColors.muted.withOpacity(0.4) : SolenneColors.midnight),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 32),
                      ],

                      // Quantity & Stock
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            height: 48,
                            decoration: BoxDecoration(
                              border: Border.all(color: SolenneColors.line),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Row(
                              children: [
                                IconButton(
                                  icon: const Icon(LucideIcons.minus, size: 16),
                                  onPressed: () => setState(() => _quantity = (_quantity - 1).clamp(1, 99)),
                                ),
                                SizedBox(
                                  width: 32,
                                  child: Text(
                                    '$_quantity',
                                    textAlign: TextAlign.center,
                                    style: SolenneTypography.body(),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(LucideIcons.plus, size: 16),
                                  onPressed: () => setState(() => _quantity = (_quantity + 1).clamp(1, _maxStock > 0 ? _maxStock : 99)),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              if (_currentVariant?.stock == 0)
                                Text('RUPTURE DE STOCK', style: SolenneTypography.caption(color: SolenneColors.error))
                              else if (_currentVariant != null && _currentVariant!.stock <= 5)
                                Text('PLUS QUE ${_currentVariant!.stock} DISPONIBLES', style: SolenneTypography.caption(color: SolenneColors.gold))
                              else
                                Text('EN STOCK', style: SolenneTypography.caption(color: const Color(0xFF2E7D32))),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 40),

                      // Add to Cart
                      SolenneButton(
                        label: _isAddingToCart ? 'AJOUT...' : (_currentVariant?.stock == 0 ? 'RUPTURE DE STOCK' : 'AJOUTER AU PANIER'),
                        onPressed: (_currentVariant?.stock ?? 1) > 0 ? _addToCart : null,
                      ),
                      const SizedBox(height: 48),

                      // Shipping Info Box
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: SolenneColors.ivoryWarm.withOpacity(0.5),
                          border: Border.all(color: SolenneColors.line),
                        ),
                        child: Column(
                          children: [
                            _buildInfoItem(LucideIcons.truck, 'Livraison express 48 Wilayas'),
                            const SizedBox(height: 16),
                            _buildInfoItem(LucideIcons.banknote, 'Paiement à la livraison disponible'),
                            const SizedBox(height: 16),
                            _buildInfoItem(LucideIcons.shieldCheck, 'Produit 100% authentique SOLENNE'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 48),

                      // Accordions
                      _buildAccordion('Détails & Matières', product.material),
                      _buildAccordion('Conseils d\'entretien', 'Lavage à la main recommandé. Repassage doux.'),
                      _buildAccordion('Livraison & Retours', 'Livraison sous 2 à 5 jours. Retours acceptés sous 7 jours.'),
                      
                      const SizedBox(height: 64),

                      // Related Products
                      if (_relatedProducts.isNotEmpty) ...[
                        Text(
                          'VOUS POURRIEZ AUSSI AIMER',
                          style: SolenneTypography.sectionTitle(),
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          height: 320,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: _relatedProducts.length,
                            separatorBuilder: (_, __) => const SizedBox(width: 16),
                            itemBuilder: (context, i) {
                              final p = _relatedProducts[i];
                              return SizedBox(
                                width: 160,
                                child: SolenneProductCard(
                                  product: p,
                                  isWishlisted: wishlist.isWishlisted(p.id),
                                  onWishlistTap: () => wishlist.toggle(p.id),
                                  onTap: () => Navigator.of(context).pushReplacement(
                                    MaterialPageRoute(builder: (_) => ProductDetailsScreen(productId: p.id)),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Sticky Bottom Bar
          AnimatedPositioned(
            duration: const Duration(milliseconds: 400),
            curve: Curves.easeInOutCubic,
            bottom: _showStickyBar ? 0 : -100,
            left: 0,
            right: 0,
            child: Container(
              padding: EdgeInsets.fromLTRB(24, 16, 24, MediaQuery.of(context).padding.bottom + 16),
              decoration: BoxDecoration(
                color: SolenneColors.ivory,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 20,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: SolenneTypography.label(fontSize: 12),
                        ),
                        SolennePrice(amount: _displayPrice, fontSize: 16),
                      ],
                    ),
                  ),
                  const SizedBox(width: 24),
                  SizedBox(
                    width: 160,
                    child: SolenneButton(
                      label: 'ACHETER',
                      onPressed: (_currentVariant?.stock ?? 1) > 0 ? _addToCart : null,
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

  Widget _buildSectionHeader(String title, String? selectedValue) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: SolenneTypography.label(color: SolenneColors.muted)),
        if (selectedValue != null)
          Text(
            selectedValue.toUpperCase(),
            style: SolenneTypography.label(color: SolenneColors.midnight),
          ),
      ],
    );
  }

  Widget _buildInfoItem(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 18, color: SolenneColors.midnight.withOpacity(0.6)),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: SolenneTypography.caption(color: SolenneColors.midnight.withOpacity(0.7)),
          ),
        ),
      ],
    );
  }

  Widget _buildAccordion(String title, String? content) {
    if (content == null || content.isEmpty) return const SizedBox.shrink();
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: SolenneColors.line)),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          title: Text(
            title.toUpperCase(),
            style: SolenneTypography.label(fontSize: 11, color: SolenneColors.midnight.withOpacity(0.7)),
          ),
          tilePadding: EdgeInsets.zero,
          iconColor: SolenneColors.gold,
          childrenPadding: const EdgeInsets.only(bottom: 24),
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                content,
                style: SolenneTypography.editorialBody(fontSize: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _parseColor(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) hex = 'FF$hex';
    return Color(int.parse(hex, radix: 16));
  }
}

class FullscreenGallery extends StatefulWidget {
  const FullscreenGallery({
    super.key,
    required this.images,
    required this.initialIndex,
  });

  final List<String> images;
  final int initialIndex;

  @override
  State<FullscreenGallery> createState() => _FullscreenGalleryState();
}

class _FullscreenGalleryState extends State<FullscreenGallery> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          PageView.builder(
            itemCount: widget.images.length,
            controller: PageController(initialPage: widget.initialIndex),
            onPageChanged: (i) => setState(() => _currentIndex = i),
            itemBuilder: (context, i) {
              return InteractiveViewer(
                minScale: 0.5,
                maxScale: 4.0,
                child: Center(
                  child: UrlUtils.buildImage(
                    widget.images[i],
                    fit: BoxFit.contain,
                  ),
                ),
              );
            },
          ),
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            right: 20,
            child: IconButton(
              icon: const Icon(LucideIcons.x, color: Colors.white, size: 30),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          Positioned(
            bottom: MediaQuery.of(context).padding.bottom + 20,
            left: 0,
            right: 0,
            child: Text(
              '${_currentIndex + 1} / ${widget.images.length}',
              textAlign: TextAlign.center,
              style: SolenneTypography.label(color: Colors.white.withOpacity(0.7)),
            ),
          ),
        ],
      ),
    );
  }
}
