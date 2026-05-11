/**
 * 出货单 Mock（无 token）：
 * - 司机页「车辆识别」演示：单条快照 + 刷新模拟新车（不接真实海康）。
 * 库管列表与提交已走后端，见 `back-vehicle.ts`。
 */

const SNAPSHOT_KEY = 'outbound_latest_snapshot'
const MOCK_HI_IDX_KEY = 'outbound_mock_hi_idx'

const PLATE_POOL = ['京A88100', '京A88101', '鲁B88888', '粤C66666'] as const

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function plateAtIndex(i: number): string {
  return PLATE_POOL[i % PLATE_POOL.length]
}

function photoForPlate(plate: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(plate)}/400/240`
}

export type HikvisionLatest = {
  plateNumber: string
  vehiclePhotoUrl: string
  updatedAt: string
}

type LatestSnapshot = {
  latestHikvision: HikvisionLatest
}

export function readLatestSnapshot(): LatestSnapshot | null {
  try {
    const raw = sessionStorage.getItem(SNAPSHOT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as LatestSnapshot
  } catch {
    return null
  }
}

function writeLatestSnapshot(s: LatestSnapshot): void {
  sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(s))
}

/** 确保存在「最近一条」海康 Mock（首次进入司机页时初始化） */
function ensureLatestHikvision(): HikvisionLatest {
  const existing = readLatestSnapshot()
  const now = new Date().toISOString()
  if (existing?.latestHikvision) {
    return existing.latestHikvision
  }
  let idx = Number(sessionStorage.getItem(MOCK_HI_IDX_KEY) || '0')
  if (!Number.isFinite(idx)) idx = 0
  const plate = plateAtIndex(idx)
  const hi: HikvisionLatest = {
    plateNumber: plate,
    vehiclePhotoUrl: photoForPlate(plate),
    updatedAt: now,
  }
  writeLatestSnapshot({
    latestHikvision: hi,
  })
  return hi
}

/** 司机页：获取当前「最近一条」识别结果（对齐后端 GET /latest 语义） */
export async function mockFetchLatestHikvisionForDriver(): Promise<HikvisionLatest> {
  await sleep(400)
  return ensureLatestHikvision()
}

/**
 * 模拟道闸新识别 / 后端推送更新：刷新「最近一条」，并清空与本车无关的司机填报（演示用）。
 */
export async function mockRefreshLatestHikvisionEvent(): Promise<HikvisionLatest> {
  await sleep(350)
  let idx = Number(sessionStorage.getItem(MOCK_HI_IDX_KEY) || '0')
  if (!Number.isFinite(idx)) idx = 0
  idx += 1
  sessionStorage.setItem(MOCK_HI_IDX_KEY, String(idx))
  const plate = plateAtIndex(idx)
  const hi: HikvisionLatest = {
    plateNumber: plate,
    vehiclePhotoUrl: photoForPlate(plate),
    updatedAt: new Date().toISOString(),
  }
  writeLatestSnapshot({
    latestHikvision: hi,
  })
  return hi
}
