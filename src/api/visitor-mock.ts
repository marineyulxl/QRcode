/**
 * 占位 API：结构与后续真实后端对齐；勿在此写入任何密钥。
 * 配色/风格对齐 UI UX Pro Max：Minimalism + 园区访客正式场景（见 tailwind.config.js 注释）。
 */

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function summarizeBase64(dataUrl: string, max = 48): string {
  if (dataUrl.length <= max) return dataUrl
  return `${dataUrl.slice(0, max)}…(len=${dataUrl.length})`
}

/** 访客信息随本单提交；接海康时由后端在成功落库后处理，无需单独前端开关 */
export type VisitorPersonSubmitBody = {
  visitorName: string
  mobile: string
  /** JPEG data URL，便于后续改为 multipart */
  photoDataUrl: string
  photoFileName: string
  companionCount: number | null
  reason: string
  idNumber: string
}

/** 车牌随本单提交；接海康时由后端在成功落库后同步，无需单独前端开关 */
export type VisitorVehicleSubmitBody = {
  driverName: string
  driverIdNumber: string
  plateNumber: string
  vehicleType: string
  mobile: string
  driverPhotoDataUrl: string
  driverPhotoFileName: string
  vehiclePhotoDataUrl: string
  vehiclePhotoFileName: string
}

async function submitPerson(body: VisitorPersonSubmitBody): Promise<void> {
  await sleep(900)
  console.info('[VisitorApi.submitPerson] mock payload', {
    ...body,
    photoDataUrl: summarizeBase64(body.photoDataUrl),
  })
}

async function submitVehicle(body: VisitorVehicleSubmitBody): Promise<void> {
  await sleep(900)
  console.info('[VisitorApi.submitVehicle] mock payload', {
    ...body,
    driverPhotoDataUrl: summarizeBase64(body.driverPhotoDataUrl),
    vehiclePhotoDataUrl: summarizeBase64(body.vehiclePhotoDataUrl),
  })
}

/** 与后续 `requestClient` 替换时保持同名方法即可 */
export const VisitorApi = {
  submitPerson,
  submitVehicle,
}
