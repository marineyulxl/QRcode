import type { CommonResult } from '#/api/request'
import { pickCreateSuccessMessage, request } from '#/api/request'

export type FrontPersonnelCreateBody = {
  name: string
  idCard: string
  phone: string
  picture: string
  number: string
  subject: string
}

export async function createFrontPersonnel(body: FrontPersonnelCreateBody): Promise<string> {
  const { data: res } = await request.post<CommonResult<string | number>>(
    '/camera/front-personnel/create',
    body,
  )
  return pickCreateSuccessMessage(res.data, res.msg, '信息录入成功')
}
