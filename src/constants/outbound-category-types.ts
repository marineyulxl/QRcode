/**
 * 出库类别：界面仅展示 label；assignee 供后端路由责任人时使用，勿直接展示给库管。
 */
export const OUTBOUND_CATEGORIES = [
  { value: 'maintenance', label: '检修', assignee: '宋刚' },
  { value: 'anti_corrosion', label: '防腐', assignee: '章洪波' },
  { value: 'short_joint', label: '短节', assignee: '邹建军' },
] as const

export type OutboundCategoryValue = (typeof OUTBOUND_CATEGORIES)[number]['value']

export function categoryOptionLabel(value: OutboundCategoryValue): string {
  const row = OUTBOUND_CATEGORIES.find((x) => x.value === value)
  return row?.label ?? value
}
