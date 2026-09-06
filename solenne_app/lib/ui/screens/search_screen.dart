import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_empty_state.dart';
import '../components/solenne_product_card.dart';
import '../../models/product_model.dart';
import '../../services/product_repository.dart';
import 'product_details_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _controller = TextEditingController();
  List<ProductModel> _results = [];
  bool _loading = false;
  bool _searched = false;

  Future<void> _runSearch(String query) async {
    if (query.trim().isEmpty) return;
    setState(() => _loading = true);
    final results = await context.read<ProductRepository>().search(query.trim());
    setState(() {
      _results = results;
      _loading = false;
      _searched = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: SolenneSpacing.pageHorizontal,
        title: TextField(
          controller: _controller,
          autofocus: true,
          style: SolenneTypography.body(),
          onSubmitted: _runSearch,
          decoration: const InputDecoration(
            hintText: 'Search products',
            border: InputBorder.none,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.search, color: SolenneColors.midnight, size: 20),
            onPressed: () => _runSearch(_controller.text),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: SolenneColors.midnight, strokeWidth: 1.5))
          : !_searched
              ? const SolenneEmptyState(title: 'Search SOLENNE', icon: LucideIcons.search)
              : _results.isEmpty
                  ? const SolenneEmptyState(title: 'No results found', icon: LucideIcons.searchX)
                  : GridView.builder(
                      padding: const EdgeInsets.all(SolenneSpacing.pageHorizontal),
                      itemCount: _results.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        mainAxisSpacing: SolenneSpacing.lg,
                        crossAxisSpacing: SolenneSpacing.md,
                        childAspectRatio: 0.62,
                      ),
                      itemBuilder: (context, i) => SolenneProductCard(
                        product: _results[i],
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => ProductDetailsScreen(productId: _results[i].id)),
                        ),
                      ),
                    ),
    );
  }
}
