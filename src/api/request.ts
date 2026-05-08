import axios, { type AxiosError } from 'axios'

import { apiBaseUrl, tenantId } from '#/config/env'

export type CommonResult<T = unknown> = {
  code?: number
  msg?: string
  data?: T
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
