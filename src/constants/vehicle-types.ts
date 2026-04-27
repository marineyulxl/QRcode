export const VEHICLE_TYPES = [
  '小型客车',
  '大型客车',
  '货车',
  '面包车',
  '新能源车',
  '危险品运输车',
  '工程车',
  '其他',
] as const

export type VehicleType = (typeof VEHICLE_TYPES)[number]
