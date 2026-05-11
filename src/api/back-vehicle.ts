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

/** GET `/camera/back-vehicle/page`（库管列表；无 query 表示全量） */
export type BackVehiclePageQuery = {
  name?: string
  phone?: string
  license?: string
  idCard?: string
  createTime?: string
  approvalOpinion?: string
}

/** 与接口返回一致（未填库管字段为 null） */
export type BackVehiclePageItem = {
  id: number
  name: string
  phone: string
  idCard: string
  selfiePhoto: string
  license: string
  vehiclePhoto: string
  createTime: number | null
  itemName: string | null
  quantity: string | null
  type: string | null
  approvalTime: number | null
  approvalOpinion: string
}

/** 库管页下拉：`0` 未审批，待补录 */
export function pendingLibraryRows(list: BackVehiclePageItem[]): BackVehiclePageItem[] {
  return list.filter((r) => r.approvalOpinion === '0')
}

export async function fetchBackVehiclePage(
  query: BackVehiclePageQuery = {},
): Promise<{ total: number; list: BackVehiclePageItem[] }> {
  const { data: res } = await request.get<CommonResult<{ total: number; list: BackVehiclePageItem[] }>>(
    '/camera/back-vehicle/page',
    { params: query },
  )
  const data = res.data
  return { total: data?.total ?? 0, list: Array.isArray(data?.list) ? data.list : [] }
}

/** PUT `/camera/back-vehicle/library_update` */
export type BackVehicleLibraryUpdateBody = {
  id: number
  name: string
  phone: string
  idCard: string
  selfiePhoto: string
  license: string
  vehiclePhoto: string
  createTime?: number | null
  itemName: string
  quantity: string
  type: string
}

export function toLibraryUpdateBody(
  row: BackVehiclePageItem,
  itemName: string,
  quantity: string,
  type: string,
): BackVehicleLibraryUpdateBody {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    idCard: row.idCard,
    selfiePhoto: row.selfiePhoto ?? '',
    license: row.license,
    vehiclePhoto: row.vehiclePhoto ?? '',
    createTime: row.createTime ?? undefined,
    itemName,
    quantity,
    type,
  }
}

export async function libraryUpdateBackVehicle(body: BackVehicleLibraryUpdateBody): Promise<string> {
  const { data: res } = await request.put<CommonResult<boolean | string>>(
    '/camera/back-vehicle/library_update',
    body,
  )
  if (typeof res.data === 'string' && res.data.trim()) return res.data.trim()
  if (typeof res.msg === 'string' && res.msg.trim()) return res.msg.trim()
  return '出库登记提交成功'
}
