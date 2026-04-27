const MOBILE_RE = /^1[3-9]\d{9}$/

/** 18 位身份证格式（含末位 X），不校验校验位 */
const ID_CARD_RE =
  /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/

/** 常见大陆车牌（含新能源常见形态），偏宽松 */
const PLATE_RE =
  /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽粤青藏川宁琼使领][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4,6}[A-HJ-NP-Z0-9挂学警港澳]?$/

function asTrimmedString(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

export function isMobile(value: string | number | null | undefined): boolean {
  return MOBILE_RE.test(asTrimmedString(value))
}

export function isIdCard(value: string | number | null | undefined): boolean {
  return ID_CARD_RE.test(asTrimmedString(value))
}

export function isPlate(value: string | number | null | undefined): boolean {
  const v = asTrimmedString(value).toUpperCase()
  return PLATE_RE.test(v)
}

export function parseOptionalNonNegativeInt(value: unknown): number | null {
  const t = asTrimmedString(value)
  if (t === '') return null
  const n = Number.parseInt(t, 10)
  if (!Number.isFinite(n) || n < 0) return null
  return n
}
