import type { CommonResult } from '#/api/request'
import { pickCreateSuccessMessage, request } from '#/api/request'

/** POST `/camera/back-vehicle/create`（后大门 · 司机录入，与接口文档一致） */
export type BackVehicleCreateBody = {
  name: string
  idCard: string
  phone: string
  selfiePhoto: string
}

export async function createBackVehicle(body: BackVehicleCreateBody): Promise<string> {
  const { data: res } = await request.post<CommonResult<string | number>>(
    '/camera/back-vehicle/create',
    body,
  )
  return pickCreateSuccessMessage(res.data, res.msg, '车辆信息录入成功')
}
