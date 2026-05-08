import type { CommonResult } from '#/api/request'
import { request } from '#/api/request'

export type FrontPersonnelCreateBody = {
  name: string
  idCard: string
  phone: string
  picture: string
  number: string
  subject: string
}

/** 成功提示用接口里的 `data`（字符串）；没有则用 `msg` */
export async function createFrontPersonnel(body: FrontPersonnelCreateBody): Promise<string> {
  const { data: res } = await request.post<CommonResult<string>>(
    '/camera/front-personnel/create',
    body,
  )
  const fromData = res.data?.trim()
  if (fromData) return fromData
  return res.msg?.trim() || '提交成功'
}
