# 变更回溯（摘要）

格式：`YYYY-MM-DD` — 一句话 — 详见 `features/xx-xxx.md`

---

## 2026-05-07

- **人员登记接后端**：`POST /infra/file/upload` 上传人脸 → `POST /camera/front-personnel/create` 提交；请求头 `tenant-id`（默认 `1`，见 `src/config/env.ts`）。详见 [`features/01-来访登记三页静态站.md`](features/01-来访登记三页静态站.md)。

## 2026-05-06

- **出货单（Mock）**：`/out/driver`、`/out/warehouse`，无 token；司机拉「最近一条」海康 Mock；库管填报 + `outbound-category-types`；快照存 sessionStorage。详见 [`features/02-出货单双角色扫码.md`](features/02-出货单双角色扫码.md)。
- 新增 `parsePositiveInt`（出库数量校验）。
- 初始化 **来访登记三页静态 H5**（入口 / 人员 / 车辆）、Tailwind、占位提交、拍照压缩与校验。详见 [`features/01-来访登记三页静态站.md`](features/01-来访登记三页静态站.md)。
- 去掉人员/车辆表单的「海康」勾选（提交即整单语义，由后端后续决定对接）。
- 修复随访人数 `type="number"` 导致 `trim` 报错（改为文本数字输入 + 校验工具归一化）。
- Vite `server.host` 便于局域网 IP 调试；部署与二维码说明写在 `DEPLOY.md`。

## 后续

- 出货单接 **真实后端 + 海康**：替换 Mock，见 [`features/02-出货单双角色扫码.md`](features/02-出货单双角色扫码.md) 第五节。
