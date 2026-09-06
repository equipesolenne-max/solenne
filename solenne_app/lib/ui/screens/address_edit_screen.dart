import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_button.dart';
import '../components/solenne_text_field.dart';
import '../../models/address_model.dart';
import '../../state/address_state.dart';

class AddressEditScreen extends StatefulWidget {
  const AddressEditScreen({super.key, this.address});
  final AddressModel? address;

  @override
  State<AddressEditScreen> createState() => _AddressEditScreenState();
}

class _AddressEditScreenState extends State<AddressEditScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  late TextEditingController _wilayaController;
  late TextEditingController _communeController;
  late TextEditingController _postalCodeController;
  bool _isDefault = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.address?.fullName);
    _phoneController = TextEditingController(text: widget.address?.phone);
    _addressController = TextEditingController(text: widget.address?.address);
    _wilayaController = TextEditingController(text: widget.address?.wilaya);
    _communeController = TextEditingController(text: widget.address?.commune);
    _postalCodeController = TextEditingController(text: widget.address?.postalCode);
    _isDefault = widget.address?.isDefault ?? false;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _wilayaController.dispose();
    _communeController.dispose();
    _postalCodeController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final address = AddressModel(
      id: widget.address?.id ?? 0,
      fullName: _nameController.text.trim(),
      phone: _phoneController.text.trim(),
      address: _addressController.text.trim(),
      wilaya: _wilayaController.text.trim(),
      commune: _communeController.text.trim(),
      postalCode: _postalCodeController.text.trim(),
      isDefault: _isDefault,
    );

    try {
      if (widget.address == null) {
        await context.read<AddressState>().addAddress(address);
      } else {
        await context.read<AddressState>().updateAddress(widget.address!.id, address);
      }
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save address: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.address != null;

    return Scaffold(
      backgroundColor: SolenneColors.ivory,
      appBar: AppBar(
        title: Text(isEditing ? 'EDIT ADDRESS' : 'NEW ADDRESS', style: SolenneTypography.sectionTitle()),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(SolenneSpacing.pageHorizontal),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('CONTACT DETAILS', style: SolenneTypography.eyebrow()),
                const SizedBox(height: SolenneSpacing.md),
                SolenneTextField(
                  controller: _nameController,
                  label: 'Full Name',
                  hint: 'e.g. Sarah Benali',
                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: SolenneSpacing.md),
                SolenneTextField(
                  controller: _phoneController,
                  label: 'Phone Number',
                  hint: '05xx xxx xxx',
                  keyboardType: TextInputType.phone,
                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: SolenneSpacing.xl),
                Text('SHIPPING LOCATION', style: SolenneTypography.eyebrow()),
                const SizedBox(height: SolenneSpacing.md),
                SolenneTextField(
                  controller: _addressController,
                  label: 'Street Address',
                  hint: 'House number and street name',
                  maxLines: 2,
                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: SolenneSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: SolenneTextField(
                        controller: _wilayaController,
                        label: 'Wilaya',
                        hint: 'e.g. Algiers',
                        validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                      ),
                    ),
                    const SizedBox(width: SolenneSpacing.md),
                    Expanded(
                      child: SolenneTextField(
                        controller: _communeController,
                        label: 'Commune',
                        hint: 'e.g. Hydra',
                        validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: SolenneSpacing.md),
                SolenneTextField(
                  controller: _postalCodeController,
                  label: 'Postal Code (Optional)',
                  hint: '16xxx',
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: SolenneSpacing.lg),
                Row(
                  children: [
                    Checkbox(
                      value: _isDefault,
                      onChanged: (v) => setState(() => _isDefault = v ?? false),
                      activeColor: SolenneColors.midnight,
                      checkColor: SolenneColors.ivory,
                    ),
                    GestureDetector(
                      onTap: () => setState(() => _isDefault = !_isDefault),
                      child: Text('Set as default address', style: SolenneTypography.body()),
                    ),
                  ],
                ),
                const SizedBox(height: SolenneSpacing.xxl),
                SolenneButton(
                  label: isEditing ? 'Update Address' : 'Save Address',
                  loading: _isLoading,
                  onPressed: _save,
                ),
                const SizedBox(height: SolenneSpacing.xl),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
