/// Customer model mapping Django user data.
class CustomerModel {
  const CustomerModel({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.phone = '',
  });

  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;

  String get name => '$firstName $lastName'.trim();

  factory CustomerModel.fromMap(String id, Map<String, dynamic> map) {
    return CustomerModel(
      id: id,
      firstName: map['first_name'] as String? ?? '',
      lastName: map['last_name'] as String? ?? '',
      email: map['email'] as String? ?? '',
      phone: map['phone'] as String? ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'phone': phone,
    };
  }
}
