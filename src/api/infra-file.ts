import type { CommonResult } from '#/api/request'
import { request } from '#/api/request'

/** `POST /infra/file/upload`，`data` 为文件访问 URL 字符串 */
export async function uploadInfraFile(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)

  const { data: res } = await request.post<CommonResult<string>>('/infra/file/upload', form)
  const url = res.data?.trim()
  if (!url) throw new Error('上传成功但未返回文件地址')
  return url
}
