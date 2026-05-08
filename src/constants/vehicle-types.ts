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

/** 接口字段 `type` 字符串编码（与后端字典一致时可按需改） */
export const VEHICLE_TYPE_API_CODE: Record<VehicleType, string> = {
  小型客车: '1',
  大型客车: '2',
  货车: '3',
  面包车: '4',
  新能源车: '5',
  危险品运输车: '6',
  工程车: '7',
  其他: '8',
}
