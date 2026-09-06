import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_empty_state.dart';
import '../components/solenne_button.dart';
import '../components/solenne_loading.dart';
import '../../state/address_state.dart';
import '../../models/address_model.dart';
import 'address_edit_screen.dart';

class AddressesScreen extends StatefulWidget {
  const AddressesScreen({super.key});

  @override
  State<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends State<AddressesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AddressState>().fetchAddresses();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SolenneColors.ivory,
      appBar: AppBar(
        title: Text('ADDRESSES', style: SolenneTypography.sectionTitle()),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Consumer<AddressState>(
        builder: (context, state, child) {
          if (state.isLoading && state.addresses.isEmpty) {
            return const SolenneLoading();
          }

          if (state.addresses.isEmpty) {
            return SolenneEmptyState(
              title: 'No saved addresses',
              message: 'Add a delivery address to speed up checkout next time.',
              icon: LucideIcons.mapPin,
              actionLabel: 'Add Address',
              onAction: () => _openAddressForm(context),
            );
          }

          return RefreshIndicator(
            onRefresh: state.fetchAddresses,
            color: SolenneColors.midnight,
            backgroundColor: SolenneColors.ivory,
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(
                horizontal: SolenneSpacing.pageHorizontal,
                vertical: SolenneSpacing.lg,
              ),
              itemCount: state.addresses.length + 1,
              itemBuilder: (context, index) {
                if (index == state.addresses.length) {
                  return Padding(
                    padding: const EdgeInsets.only(top: SolenneSpacing.lg, bottom: SolenneSpacing.xxl),
                    child: SolenneButton(
                      label: 'Add New Address',
                      variant: SolenneButtonVariant.secondary,
                      onPressed: () => _openAddressForm(context),
                    ),
                  );
                }

                final address = state.addresses[index];
                return _AddressCard(address: address);
              },
            ),
          );
        },
      ),
    );
  }

  void _openAddressForm(BuildContext context, [AddressModel? address]) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => AddressEditScreen(address: address),
      ),
    );
  }
}

class _AddressCard extends StatelessWidget {
  const _AddressCard({required this.address});
  final AddressModel address;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: SolenneSpacing.md),
      decoration: BoxDecoration(
        color: SolenneColors.ivoryWarm,
        border: Border.all(color: address.isDefault ? SolenneColors.midnight : SolenneColors.line),
        borderRadius: SolenneBorders.borderRadius,
      ),
      padding: const EdgeInsets.all(SolenneSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                address.fullName,
                style: SolenneTypography.body().copyWith(fontWeight: FontWeight.w600),
              ),
              if (address.isDefault)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: SolenneColors.midnight,
                    borderRadius: BorderRadius.circular(2),
                  ),
                  child: Text(
                    'DEFAULT',
                    style: SolenneTypography.eyebrow(color: SolenneColors.ivory).copyWith(fontSize: 8),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${address.address}\n${address.commune}, ${address.wilaya}${address.postalCode.isNotEmpty ? ' (${address.postalCode})' : ''}',
            style: SolenneTypography.body(color: SolenneColors.muted),
          ),
          const SizedBox(height: 8),
          Text(
            address.phone,
            style: SolenneTypography.body(color: SolenneColors.muted),
          ),
          const SizedBox(height: SolenneSpacing.md),
          const Divider(color: SolenneColors.line),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () => _showDeleteDialog(context),
                child: Text('DELETE', style: SolenneTypography.button(color: SolenneColors.error, fontSize: 11)),
              ),
              const SizedBox(width: SolenneSpacing.sm),
              TextButton(
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => AddressEditScreen(address: address)),
                ),
                child: Text('EDIT', style: SolenneTypography.button(color: SolenneColors.midnight, fontSize: 11)),
              ),
              if (!address.isDefault) ...[
                const SizedBox(width: SolenneSpacing.sm),
                TextButton(
                  onPressed: () => context.read<AddressState>().setDefault(address.id),
                  child: Text('SET AS DEFAULT', style: SolenneTypography.button(color: SolenneColors.gold, fontSize: 11)),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: SolenneColors.ivory,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: SolenneBorders.borderRadius),
        title: Text('Delete Address', style: SolenneTypography.heading(fontSize: 20)),
        content: Text(
          'Are you sure you want to remove this address?',
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
              context.read<AddressState>().deleteAddress(address.id);
            },
            child: Text('DELETE', style: SolenneTypography.button(color: SolenneColors.error)),
          ),
        ],
      ),
    );
  }
}
