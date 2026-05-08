/** 车辆登记占位：接后端后替换为真实接口（人员已走 `front-personnel` + `infra-file`）。 */

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function summarizeBase64(dataUrl: string, max = 48): string {
  if (dataUrl.length <= max) return dataUrl
  return `${dataUrl.slice(0, max)}…(len=${dataUrl.length})`
}

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

async function submitVehicle(body: VisitorVehicleSubmitBody): Promise<void> {
  await sleep(900)
  console.info('[VisitorApi.submitVehicle] mock payload', {
    ...body,
    driverPhotoDataUrl: summarizeBase64(body.driverPhotoDataUrl),
    vehiclePhotoDataUrl: summarizeBase64(body.vehiclePhotoDataUrl),
  })
}

export const VisitorApi = {
  submitVehicle,
}
