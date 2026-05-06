/**
 * 出货单 Mock（无 token）：
 * - 司机页请求「最近一条」海康识别结果（单条快照，可刷新模拟新车）。
 * - 库管页填报与司机数据在同一会话快照中合并（sessionStorage）。
 * 上线后改为后端接口；海康仅供服务端访问。
 */

import type { OutboundCategoryValue } from '#/constants/outbound-category-types'

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

export type OutboundDriverPayload = {
  driverName: string
  mobile: string
  idNumber: string
  driverPhotoDataUrl: string
  driverPhotoFileName: string
  plateNumber: string
  vehiclePhotoUrl: string
}

export type OutboundWarehousePayload = {
  plateNumber: string
  vehiclePhotoUrl: string
  materialName: string
  quantity: number
  categoryType: OutboundCategoryValue
}

export type LatestSnapshot = {
  latestHikvision: HikvisionLatest
  driver?: OutboundDriverPayload
  warehouse?: OutboundWarehousePayload
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
    driver: existing?.driver,
    warehouse: existing?.warehouse,
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
  const prev = readLatestSnapshot()
  writeLatestSnapshot({
    latestHikvision: hi,
    driver: undefined,
    warehouse: prev?.warehouse,
  })
  return hi
}

/** 库管下拉一项（接后端后与接口字段对齐） */
export type WarehousePlateOption = {
  plateNumber: string
  vehiclePhotoUrl: string
  driverName: string
  driverMobile: string
  driverIdNumber: string
}

/**
 * Mock：演示「已在场待出库」车辆（无后端时保证库管页可点开验收流程）。
 * 若快照里存在司机提交且车牌相同，则以快照为准覆盖该行（贴近真实「登记更新」）。
 */
const MOCK_SEED_ONSITE: WarehousePlateOption[] = [
  {
    plateNumber: PLATE_POOL[0],
    vehiclePhotoUrl: photoForPlate(PLATE_POOL[0]),
    driverName: '张三',
    driverMobile: '13800138001',
    driverIdNumber: '110101199001011234',
  },
  {
    plateNumber: PLATE_POOL[1],
    vehiclePhotoUrl: photoForPlate(PLATE_POOL[1]),
    driverName: '李四',
    driverMobile: '13800138002',
    driverIdNumber: '110101199002022345',
  },
  {
    plateNumber: PLATE_POOL[2],
    vehiclePhotoUrl: photoForPlate(PLATE_POOL[2]),
    driverName: '王五',
    driverMobile: '13800138003',
    driverIdNumber: '370202199003033456',
  },
  {
    plateNumber: PLATE_POOL[3],
    vehiclePhotoUrl: photoForPlate(PLATE_POOL[3]),
    driverName: '赵六',
    driverMobile: '13800138004',
    driverIdNumber: '440103199004044567',
  },
]

function driverRowFromSnapshot(d: OutboundDriverPayload): WarehousePlateOption {
  return {
    plateNumber: d.plateNumber.trim().toUpperCase(),
    vehiclePhotoUrl: d.vehiclePhotoUrl,
    driverName: d.driverName,
    driverMobile: d.mobile,
    driverIdNumber: d.idNumber,
  }
}

/**
 * 在场待出库车辆列表。
 * Mock：演示种子 + 本机快照中的司机登记（同车牌覆盖种子）；接后端后整函数替换为接口数据。
 */
export function getWarehousePlateOptions(): WarehousePlateOption[] {
  const list = MOCK_SEED_ONSITE.map((r) => ({ ...r, plateNumber: r.plateNumber.toUpperCase() }))
  const d = readLatestSnapshot()?.driver
  if (!d) return list
  const row = driverRowFromSnapshot(d)
  const idx = list.findIndex((o) => o.plateNumber === row.plateNumber)
  if (idx >= 0) {
    const next = [...list]
    next[idx] = row
    return next
  }
  return [row, ...list]
}

export async function submitOutboundDriver(payload: OutboundDriverPayload): Promise<void> {
  await sleep(550)
  let cur = readLatestSnapshot()
  if (!cur?.latestHikvision) {
    ensureLatestHikvision()
    cur = readLatestSnapshot()
  }
  if (!cur) throw new Error('快照初始化失败')
  writeLatestSnapshot({
    ...cur,
    driver: payload,
  })
  console.info('[OutboundMock] driver submitted', { plate: payload.plateNumber })
}

export async function submitOutboundWarehouse(payload: OutboundWarehousePayload): Promise<void> {
  await sleep(550)
  let cur = readLatestSnapshot()
  if (!cur?.latestHikvision) {
    ensureLatestHikvision()
    cur = readLatestSnapshot()
  }
  if (!cur) throw new Error('快照初始化失败')
  writeLatestSnapshot({
    ...cur,
    warehouse: payload,
  })
  console.info('[OutboundMock] warehouse submitted full snapshot', readLatestSnapshot())
}
