import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../theme/solenne_theme.dart';
import '../components/solenne_text_field.dart';
import '../components/solenne_button.dart';
import '../../services/inquiry_repository.dart';
import '../../state/auth_state.dart';
import 'inquiry_thread_screen.dart';

class NewInquiryScreen extends StatefulWidget {
  const NewInquiryScreen({super.key});

  @override
  State<NewInquiryScreen> createState() => _NewInquiryScreenState();
}

class _NewInquiryScreenState extends State<NewInquiryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _subject = TextEditingController();
  final _message = TextEditingController();
  String _selectedCategory = 'Order';
  bool _submitting = false;

  final List<String> _categories = [
    'Order',
    'Product',
    'Shipping',
    'Returns',
    'Payment',
    'Other'
  ];

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<AuthState>();
    setState(() => _submitting = true);
    try {
      final subject = '[$_selectedCategory] ${_subject.text.trim()}';
      final threadId = await context.read<InquiryRepository>().createThread(
        name: auth.user!.name,
        email: auth.user!.email,
        subject: subject,
        firstMessage: _message.text.trim(),
      );
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => InquiryThreadScreen(threadId: threadId)),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to send inquiry. Please try again.')),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SolenneColors.ivory,
      appBar: AppBar(
        title: Text('NEW INQUIRY', style: SolenneTypography.sectionTitle()),
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
                Text(
                  'How may we assist you?',
                  style: SolenneTypography.heading(fontSize: 22),
                ),
                const SizedBox(height: 12),
                Text(
                  'Please provide the details of your inquiry below.',
                  style: SolenneTypography.editorialBody(fontSize: 16, color: SolenneColors.muted),
                ),
                const SizedBox(height: SolenneSpacing.xl),
                Text('WHAT IS YOUR INQUIRY ABOUT?', style: SolenneTypography.label(fontSize: 12)),
                const SizedBox(height: SolenneSpacing.md),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _categories.map((cat) {
                    final isSelected = _selectedCategory == cat;
                    return ChoiceChip(
                      label: Text(cat.toUpperCase()),
                      selected: isSelected,
                      onSelected: (_) => setState(() => _selectedCategory = cat),
                      backgroundColor: SolenneColors.ivoryWarm,
                      selectedColor: SolenneColors.midnight,
                      labelStyle: SolenneTypography.label(
                        fontSize: 10,
                        color: isSelected ? SolenneColors.ivory : SolenneColors.midnight,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: SolenneBorders.borderRadius,
                        side: BorderSide(
                          color: isSelected ? SolenneColors.midnight : SolenneColors.line,
                        ),
                      ),
                      showCheckmark: false,
                    );
                  }).toList(),
                ),
                const SizedBox(height: SolenneSpacing.xl),
                SolenneTextField(
                  label: 'Subject',
                  controller: _subject,
                  hint: 'Briefly describe your inquiry',
                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: SolenneSpacing.lg),
                SolenneTextField(
                  label: 'Message',
                  controller: _message,
                  hint: 'Provide as much detail as possible...',
                  maxLines: 8,
                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: SolenneSpacing.xxl),
                SolenneButton(
                  label: 'Send Inquiry',
                  loading: _submitting,
                  onPressed: _submit,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
