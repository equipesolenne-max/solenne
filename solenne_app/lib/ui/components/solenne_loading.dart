import 'package:flutter/material.dart';
import '../../theme/solenne_theme.dart';

/// Quiet, understated loading indicator — no spinners with brand colors
/// spinning wildly, just a subtle midnight ring.
class SolenneLoading extends StatelessWidget {
  const SolenneLoading({super.key, this.size = 22});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: size,
        height: size,
        child: const CircularProgressIndicator(
          strokeWidth: 1.5,
          color: SolenneColors.midnight,
        ),
      ),
    );
  }
}
