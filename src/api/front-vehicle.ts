import type { CommonResult } from '#/api/request'
import { pickCreateSuccessMessage, request } from '#/api/request'

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
  const { data: res } = await request.post<CommonResult<string | number>>(
    '/camera/front-vehicle/create',
    body,
  )
  return pickCreateSuccessMessage(res.data, res.msg, '车辆信息录入成功')
}

export type VehicleTypeOption = { label: string; value: string }

type VehicleTypePageData = {
  total: number
  list: { id: number; content: string }[]
}

/** GET `/camera/vehicle-type/page`，无 query；下拉 `{ value: id, label: content }`；失败返回空数组 */
export async function fetchVehicleTypeOptions(): Promise<VehicleTypeOption[]> {
  try {
    const { data: res } = await request.get<CommonResult<VehicleTypePageData>>('/camera/vehicle-type/page')
    const list = res.data?.list ?? []
    return list.map((r) => ({ value: String(r.id), label: r.content }))
  } catch {
    return []
  }
}
