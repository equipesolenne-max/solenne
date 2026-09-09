class ShippingRateModel {
  final int wilayaCode;
  final String wilayaName;
  final int homeDeliveryPrice;
  final int stopDeskPrice;
  final int returnPrice;
  final bool isActive;

  ShippingRateModel({
    required this.wilayaCode,
    required this.wilayaName,
    required this.homeDeliveryPrice,
    required this.stopDeskPrice,
    required this.returnPrice,
    required this.isActive,
  });

  factory ShippingRateModel.fromJson(Map<String, dynamic> json) {
    return ShippingRateModel(
      wilayaCode: json['wilaya_code'] as int,
      wilayaName: json['wilaya_name'] as String,
      homeDeliveryPrice: json['home_delivery_price'] as int,
      stopDeskPrice: json['stop_desk_price'] as int,
      returnPrice: json['return_price'] as int,
      isActive: json['is_active'] as bool? ?? true,
    );
  }
}
