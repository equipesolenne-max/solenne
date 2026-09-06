import 'package:flutter/material.dart';
import '../../theme/solenne_theme.dart';

/// Hairline-bordered text field, Jost label — no filled Material-style
/// background.
class SolenneTextField extends StatelessWidget {
  const SolenneTextField({
    super.key,
    required this.label,
    this.controller,
    this.obscureText = false,
    this.keyboardType,
    this.onChanged,
    this.validator,
    this.errorText,
    this.enabled = true,
    this.maxLines = 1,
    this.hint,
  });

  final String label;
  final TextEditingController? controller;
  final bool obscureText;
  final TextInputType? keyboardType;
  final ValueChanged<String>? onChanged;
  final String? Function(String?)? validator;
  final String? errorText;
  final bool enabled;
  final int maxLines;
  final String? hint;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      onChanged: onChanged,
      enabled: enabled,
      validator: validator,
      maxLines: maxLines,
      style: SolenneTypography.body(),
      decoration: InputDecoration(
        labelText: label.toUpperCase(),
        hintText: hint,
        errorText: errorText,
        floatingLabelBehavior: FloatingLabelBehavior.always,
      ),
    );
  }
}
