# 部署说明（HTTPS 静态站点）

本项目为 **Vue Router history 模式** 的单页应用，构建产物在 `dist/`。扫码入口应为 **HTTPS** 下的站点根路径或子路径（例如 `https://example.com/` 或 `https://example.com/visitor/`）。

## 构建

```bash
pnpm install
pnpm run build
```

将 `dist` 目录上传到静态托管或 Web 服务器根目录（或子目录，见下文 base）。

## 二维码内容

二维码中请填入 **生产环境入口 URL**，例如：

- `https://your-domain.example/`（推荐，对应首页双按钮）

用户从首页再进入 `/person`、`/vehicle`，无需把子路径写进二维码。

## SPA 回退（必须）

直接打开或刷新 `https://host/person` 时，服务器必须返回 `index.html`，否则会出现 404。

### Nginx 示例

```nginx
server {
  listen 443 ssl;
  server_name your-domain.example;
  root /var/www/visitor/dist;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### 子路径部署

若站点挂在 `https://host/visitor/`，构建前在 `vite.config.ts` 设置：

```ts
export default defineConfig({
  base: '/visitor/',
  // ...
})
```

Nginx 的 `location /visitor/` 同样需要 `try_files` 回退到该子路径下的 `index.html`（或使用 `alias` 并指向 `dist`）。

### Netlify

仓库已包含 [`public/_redirects`](public/_redirects)，构建后会复制到 `dist/_redirects`，用于 SPA 重写。

### 其他平台

在对应平台配置「所有路径回退到 `index.html`」即可（如 CloudFront + S3、阿里云 OSS 静态网站托管的回退页等）。

## 摄像头与权限

移动端拍照依赖浏览器对 `<input type="file" capture>` 的支持；**非 HTTPS** 可能被限制。请确保线上全站 HTTPS。

## 宝塔面板（BT）部署思路

本项目是 **纯静态**（无 Node 常驻进程），宝塔上按「静态网站 + Nginx」处理即可。

### 1. 本机打包

在项目根目录执行：

```bash
pnpm install
pnpm run build
```

得到 `dist` 目录，里面有 `index.html`、`assets/` 等。

### 2. 上传到网站根目录

1. 宝塔：**网站** → **添加站点**（纯静态选 PHP 任意版本或「不创建数据库」均可，根目录自定，例如 `/www/wwwroot/visitor.yourdomain.com`）。
2. 用 **宝塔文件管理**、**SFTP** 或 **FTP**，把 **`dist` 里的全部内容**（不是 dist 文件夹本身）上传到该站点 **根目录**，保证根目录下直接能看到 `index.html`。
3. 若站点里还有默认的 `index.html` / `404.html`，用你打包生成的文件覆盖即可。

### 3. 单页路由回退（必做）

使用 **History 模式** 时，访问 `/person` 必须由 Nginx 回到 `index.html`，否则会 404。

**做法 A（推荐）：改站点配置**

1. 宝塔：**网站** → 你的站点 → **设置** → **配置文件**。
2. 在 `server { ... }` 里、负责当前站点 `root` 的段落中，保证存在（或合并为）类似配置：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

若已有 `location / { ... }`，在**该块内**补上 `try_files` 一行即可；注意不要重复写多个冲突的 `location /`。

**做法 B：伪静态**

部分环境可在 **网站 → 设置 → 伪静态** 中粘贴（若面板把规则包进 `location /`，以实际生效为准）：

```nginx
if (!-e $request_filename) {
  rewrite ^.*$ /index.html last;
}
```

保存后 **重载配置** 或 **重启 Nginx**。

### 4. HTTPS（推荐）

宝塔：**网站** → **设置** → **SSL** → 选 **Let’s Encrypt** 申请证书并开启 **强制 HTTPS**。与是否有业务后端无关，证书由 Nginx 终止 TLS，静态文件照常提供。

### 5. 验证

- 浏览器打开：`https://你的域名/` 应出现入口双按钮。
- 再直接访问：`https://你的域名/person`，应仍是登记页而不是 404。

### 6. 子目录部署（可选）

若必须挂在 `https://域名/visitor/` 下，需先在本地把 [`vite.config.ts`](vite.config.ts) 里 `base` 设为 `'/visitor/'` 再 `pnpm run build`，并把 `dist` 内容放到该子目录，同时在宝塔里为该路径配置 Nginx `alias` / `try_files` 指向该目录下的 `index.html`（与上文「子路径部署」一致）。

---

## 后续接后端

将 [`src/api/visitor-mock.ts`](src/api/visitor-mock.ts) 中的 `VisitorApi` 替换为真实 `fetch` 或统一请求客户端；图片建议改为 `multipart/form-data` 上传，勿长期把 Base64 放在前端日志中。
