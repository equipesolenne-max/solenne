import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../models/product.dart';
import 'package:intl/intl.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _activeImageIndex = 0;
  String? _selectedColor;
  bool _isAdded = false;

  @override
  void initState() {
    super.initState();
    if (widget.product.colors.isNotEmpty) {
      _selectedColor = widget.product.colors[0].name;
    }
  }

  String formatPrice(int price) {
    final formatter = NumberFormat("#,###", "fr_DZ");
    return "${formatter.format(price)} DA";
  }

  @override
  Widget build(BuildContext context) {
    final activeVariant = widget.product.colors.firstWhere(
      (c) => c.name == _selectedColor,
      orElse: () => widget.product.colors.isNotEmpty 
        ? widget.product.colors[0] 
        : ProductVariant(name: '', hex: '', images: widget.product.images, stock: 0),
    );
    
    final activeImages = activeVariant.images.isNotEmpty 
      ? activeVariant.images 
      : widget.product.images;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: SolenneColors.midnight),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined, color: SolenneColors.midnight),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.favorite_border, color: SolenneColors.midnight),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Gallery
            _buildGallery(activeImages),
            
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'SOLENNE COLLECTION',
                    style: TextStyle(
                      fontSize: 10,
                      letterSpacing: 3,
                      color: SolenneColors.gold,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    widget.product.name,
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                      fontSize: 28,
                    ),
                  ),
                  const SizedBox(height: 8),
                  if (_selectedColor != null)
                    Text(
                      _selectedColor!,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontSize: 16,
                        color: SolenneColors.midnight.withOpacity(0.6),
                      ),
                    ),
                  const SizedBox(height: 24),
                  Text(
                    formatPrice(widget.product.price),
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontSize: 20,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    widget.product.description,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      height: 1.8,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 40),
                  
                  // Color Selection
                  if (widget.product.colors.isNotEmpty) ...[
                    const Text(
                      'COLOR',
                      style: TextStyle(
                        fontSize: 10,
                        letterSpacing: 2,
                        color: Color(0x731B2A46),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildColorSelector(),
                    const SizedBox(height: 40),
                  ],
                  
                  // Add to Bag Button
                  ElevatedButton(
                    onPressed: widget.product.inStock && !_isAdded 
                      ? () {
                          setState(() => _isAdded = true);
                          Future.delayed(const Duration(seconds: 2), () {
                            if (mounted) setState(() => _isAdded = false);
                          });
                        }
                      : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _isAdded ? SolenneColors.gold : SolenneColors.midnight,
                    ),
                    child: Text(
                      !widget.product.inStock 
                        ? 'SOLD OUT' 
                        : _isAdded ? 'ADDED TO BAG ✓' : 'ADD TO BAG',
                    ),
                  ),
                  
                  const SizedBox(height: 40),
                  
                  // Accordion Sections (Simplified)
                  _buildAccordion('Details'),
                  _buildAccordion('Shipping & Delivery'),
                  _buildAccordion('Care'),
                  
                  const SizedBox(height: 60),
                  
                  // Promise
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 40),
                    decoration: const BoxDecoration(
                      border: Border(top: BorderSide(color: SolenneColors.line)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'THE SOLENNE PROMISE',
                          style: TextStyle(
                            fontSize: 10,
                            letterSpacing: 2,
                            color: Color(0x731B2A46),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Thoughtfully selected pieces, chosen for elegant materials and effortless modest style.',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontSize: 14,
                            color: SolenneColors.midnight.withOpacity(0.6),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGallery(List<String> images) {
    return Stack(
      children: [
        SizedBox(
          height: MediaQuery.of(context).size.width * 1.25,
          child: PageView.builder(
            itemCount: images.length,
            onPageChanged: (index) => setState(() => _activeImageIndex = index),
            itemBuilder: (context, index) {
              return Container(
                color: SolenneColors.ivoryWarm,
                child: Image.network(
                  images[index],
                  fit: BoxFit.cover,
                ),
              );
            },
          ),
        ),
        if (images.length > 1)
          Positioned(
            bottom: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              color: SolenneColors.midnight.withOpacity(0.7),
              child: Text(
                '${(_activeImageIndex + 1).toString().padLeft(2, '0')} / ${images.length.toString().padLeft(2, '0')}',
                style: GoogleFonts.jost(
                  color: SolenneColors.ivory,
                  fontSize: 10,
                  letterSpacing: 1.5,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildColorSelector() {
    return Wrap(
      spacing: 16,
      children: widget.product.colors.map((c) {
        final isSelected = _selectedColor == c.name;
        return GestureDetector(
          onTap: () => setState(() {
            _selectedColor = c.name;
            _activeImageIndex = 0;
          }),
          child: Container(
            width: 36,
            height: 36,
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: isSelected ? SolenneColors.midnight : Colors.transparent,
                width: 1,
              ),
            ),
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _parseColor(c.hex),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Color _parseColor(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) hex = 'FF$hex';
    return Color(int.parse(hex, radix: 16));
  }

  Widget _buildAccordion(String title) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: SolenneColors.line)),
      ),
      child: ExpansionTile(
        title: Text(
          title.toUpperCase(),
          style: const TextStyle(
            fontSize: 10,
            letterSpacing: 2,
            color: Color(0xBF1B2A46),
            fontWeight: FontWeight.w500,
          ),
        ),
        shape: const Border(),
        tilePadding: EdgeInsets.zero,
        iconColor: SolenneColors.midnight.withOpacity(0.4),
        childrenPadding: const EdgeInsets.only(bottom: 20),
        children: const [
          Text(
            'Information regarding this section will be displayed here, maintaining the Solenne editorial tone.',
            style: TextStyle(fontSize: 14, height: 1.6, color: Color(0xA61B2A46)),
          ),
        ],
      ),
    );
  }
}
