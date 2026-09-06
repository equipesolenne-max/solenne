class AddressModel {
  const AddressModel({
    required this.id,
    required this.fullName,
    required this.phone,
    required this.address,
    required this.wilaya,
    required this.commune,
    this.postalCode = '',
    this.isDefault = false,
  });

  final int id;
  final String fullName;
  final String phone;
  final String address;
  final String wilaya;
  final String commune;
  final String postalCode;
  final bool isDefault;

  factory AddressModel.fromMap(Map<String, dynamic> map) {
    return AddressModel(
      id: map['id'] as int? ?? 0,
      fullName: map['full_name'] as String? ?? '',
      phone: map['phone'] as String? ?? '',
      address: map['address'] as String? ?? '',
      wilaya: map['wilaya'] as String? ?? '',
      commune: map['commune'] as String? ?? '',
      postalCode: map['postal_code'] as String? ?? '',
      isDefault: map['is_default'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'full_name': fullName,
      'phone': phone,
      'address': address,
      'wilaya': wilaya,
      'commune': commune,
      'postal_code': postalCode,
      'is_default': isDefault,
    };
  }
}
