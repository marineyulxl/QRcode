import axios, { type AxiosError } from 'axios'

import { apiBaseUrl, tenantId } from '#/config/env'

export type CommonResult<T = unknown> = {
  code?: number
  msg?: string
  data?: T
}

/**
 * 创建类接口：`data` 为文案字符串则展示；为数字（常见为新增 id）则展示前端固定话术；
 * `msg` 非空优先于数字场景的 fallback。
 */
export function pickCreateSuccessMessage(
  data: unknown,
  msg: string | undefined,
  fallback = '提交成功',
): string {
  if (typeof data === 'string' && data.trim()) return data.trim()
  if (typeof msg === 'string' && msg.trim()) return msg.trim()
  if (typeof data === 'number' && Number.isFinite(data)) return fallback
  return fallback
}

export const request = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'tenant-id': tenantId,
    Accept: 'application/json',
  },
  timeout: 60_000,
})

request.interceptors.response.use(
  (response) => {
    const body = response.data as CommonResult | undefined
    if (body && typeof body === 'object' && 'code' in body) {
      const c = body.code
      if (c !== undefined && c !== 0 && c !== 200) {
        return Promise.reject(new Error(body.msg || '请求失败'))
      }
    }
    return response
  },
  (error: AxiosError<CommonResult>) => {
    const msg =
      error.response?.data?.msg ||
      error.response?.statusText ||
      error.message ||
      '网络错误'
    return Promise.reject(new Error(String(msg)))
  },
)
