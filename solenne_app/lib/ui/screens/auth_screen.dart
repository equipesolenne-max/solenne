import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_logo.dart';
import '../components/solenne_text_field.dart';
import '../components/solenne_button.dart';
import '../../state/auth_state.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _isRegister = false;
  bool _submitting = false;
  String? _error;

  Future<void> _submit() async {
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final auth = context.read<AuthState>();
      if (_isRegister) {
        await auth.register(_email.text.trim(), _password.text);
      } else {
        await auth.signIn(_email.text.trim(), _password.text);
      }
    } catch (e) {
      setState(() => _error = 'Something went wrong. Please check your details and try again.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(SolenneSpacing.xl),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SolenneLogo(variant: SolenneLogoVariant.primary, showTagline: true, iconSize: 44, wordmarkSize: 24),
                const SizedBox(height: SolenneSpacing.xxl),
                SolenneTextField(label: 'Email', controller: _email, keyboardType: TextInputType.emailAddress),
                const SizedBox(height: SolenneSpacing.md),
                SolenneTextField(label: 'Password', controller: _password, obscureText: true),
                if (_error != null) ...[
                  const SizedBox(height: SolenneSpacing.md),
                  Text(_error!, style: SolenneTypography.caption(color: SolenneColors.error)),
                ],
                const SizedBox(height: SolenneSpacing.lg),
                SolenneButton(
                  label: _isRegister ? 'Create Account' : 'Sign In',
                  loading: _submitting,
                  onPressed: _submit,
                ),
                const SizedBox(height: SolenneSpacing.md),
                TextButton(
                  onPressed: () => setState(() => _isRegister = !_isRegister),
                  child: Text(
                    _isRegister ? 'Already have an account? Sign in' : 'New here? Create an account',
                    style: SolenneTypography.caption(color: SolenneColors.midnight),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
