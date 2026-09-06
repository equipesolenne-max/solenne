import 'package:flutter/material.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_button.dart';
import 'root_shell.dart';

/// Order confirmation — one of the few screens that uses packaging
/// imagery per the brand identity's packaging visual language.
class OrderConfirmationScreen extends StatelessWidget {
  const OrderConfirmationScreen({super.key, required this.orderId});

  final String orderId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(SolenneSpacing.xl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                height: 180,
                width: 140,
                decoration: BoxDecoration(
                  gradient: SolenneColors.bagGradient,
                  boxShadow: SolenneBorders.packagingShadow,
                ),
                alignment: Alignment.center,
                child: Text('SOLENNE', style: SolenneTypography.wordmark(fontSize: 16)),
              ),
              const SizedBox(height: SolenneSpacing.xxl),
              Text('Thank you', style: SolenneTypography.heading(fontSize: 24), textAlign: TextAlign.center),
              const SizedBox(height: SolenneSpacing.sm),
              Text(
                'Your order #$orderId has been placed and is being prepared with care.',
                style: SolenneTypography.editorialBody(color: SolenneColors.muted),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: SolenneSpacing.xl),
              SolenneButton(
                label: 'Back to home',
                fullWidth: false,
                onPressed: () => Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const RootShell()),
                  (route) => false,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
