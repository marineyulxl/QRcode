import type { CommonResult } from '#/api/request'
import { request } from '#/api/request'

export type FrontVehicleCreateBody = {
  name: string
  idCard: string
  phone: string
  license: string
  type: string
  selfiePhoto: string
  vehiclePhoto: string
}

export async function createFrontVehicle(body: FrontVehicleCreateBody): Promise<string> {
  const { data: res } = await request.post<CommonResult<string>>('/camera/front-vehicle/create', body)
  const fromData = res.data?.trim()
  if (fromData) return fromData
  return res.msg?.trim() || '提交成功'
}
