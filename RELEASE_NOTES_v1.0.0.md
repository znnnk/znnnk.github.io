# v1.0.0 — 个人主页首个正式版本

基于 **Vue 3 + Vite 4** 的个人主页，托管于 **GitHub Pages**，零成本、零备案、零运维。这一版把「我是谁 / 我做过什么 / 我写过什么」三件事收进一个页面，并且让数据能自己更新。

---

## ✨ 亮点

- **全静态部署**：构建产物即站点，不依赖任何后端服务，Pages 免费托管。
- **数据自动更新**：GitHub Actions 每天定时抓取 CSDN 文章与浏览量，落盘成同源 JSON，前端直读，不碰跨域与 WAF。
- **三级降级不空白**：文章数据「同源 JSON → rss2json → 本地示例」逐级回退，接口挂了页面照常有内容。
- **暗色主题、纯 CSS**：无 UI 框架，首屏轻，主题变量集中在 `src/styles/main.css`，改色只改一处。

## 🧩 功能

### Hero 区
姓名/ID 展示、中英文签名、CTA 按钮，背景图为 `public/hero-bg.webp`。

### GitHub 项目
- 通过 GitHub API 动态拉取公开仓库，按最近更新时间排序（`per_page=30`）。
- `excludeRepos` 可过滤掉个人主页仓库本身等不需要展示的仓库。
- `src/data/projects.js` 支持手动维护项目：手动条目**优先置顶**，`placeholder: true` 的占位条目在存在真实仓库时自动隐藏。
- 60 秒 localStorage 节流，避免触发 GitHub API 未认证访问限额；请求失败时回退过期缓存，页面不会空。

### GitHub 活跃度
一年贡献热力图，由第三方 SVG 服务渲染，无需额外依赖。

### 技术博客（CSDN）
- **主页入口卡**：展示总浏览量（`1.3w+ 浏览`，可在 config 中关掉）与文章总数。
- **文章列表**：标题、发布时间、单篇浏览量，支持「按时间 / 按浏览量」两种排序；无浏览量数据时排序按钮自动隐藏。
- 6 小时 localStorage 缓存（调试开关 `DISABLE_CACHE`），静态数据超过 3 天视为过期并回退 rss2json 实时拉取。

### 路由与其他页面
- Vue Router **hash 模式**，规避 GitHub Pages 刷新 404，无需额外 404 配置。
- `/data` 子页面已预留路由，当前显示「待建设」占位。

### 数据管道
`scripts/fetch-data.mjs`（Node 内置 fetch，零额外依赖）→ `public/data/articles.json` → 前端读取。

抓取优先级：

1. **CSDN 社区 API（主源）**：`/community/home-api/v1/get-business-list`，一次返回全部文章，含标题、链接、发布时间、浏览量。带 `User-Agent` + `Referer` + `Accept` 头，匿名即可，不需要 Cookie。
2. **rss2json（兜底）**：解析 CSDN RSS，仅最近 10 篇且无浏览量。
3. 两者都失败时**保留上一次的 `articles.json`**，脚本不以失败退出。

### 自动化
- `deploy.yml`：push 到 `main` 自动构建并部署 Pages（Node 18）。
- `refresh-data.yml`：每天 UTC 22:00（北京时间次日 6:00）抓数据；**有变化才提交**（不产生空 commit），提交后显式调用 `gh workflow run deploy.yml`——`GITHUB_TOKEN` 推送的 commit 不会自动触发其他 workflow，这一步不能省。也支持 Actions 页面手动 `Run workflow`。

## 🛠 技术栈

| 项 | 选型 |
|---|---|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 构建 | Vite 4 |
| 路由 | Vue Router 4（hash 模式） |
| 样式 | 纯 CSS + CSS 变量，内置暗色主题 |
| 部署 | GitHub Pages（Actions / `gh-pages` 两种方式） |

## 🚀 快速开始

```bash
npm install                    # Node 18+
npm run dev                    # http://localhost:5173
npm run build                  # 构建到 dist/
npm run preview                # 预览构建产物
node scripts/fetch-data.mjs    # 手动跑一次数据抓取
npm run deploy                 # 构建并推送到 gh-pages 分支
```

使用前请在 `src/data/config.js` 替换 `githubUsername`、`csdnUrl`、`csdnId`、`profile.*` 等占位信息；部署到子路径仓库时需同步修改 `vite.config.js` 的 `base`。

## ⚠️ 已知限制

- **GitHub API 限流**：未认证请求 60 次/小时，已有 60 秒缓存兜底；高频访问仍可能命中限额。
- **CSDN 接口带 WAF**：浏览器端无法跨域直取，故采用「Actions 服务端抓取 + 同源 JSON」方案；抓取链路依赖 CSDN 接口结构，接口变动需同步改脚本。
- **rss2json 兜底较弱**：免费额度有限，且只返回最近 10 篇、不含浏览量。
- **定时任务非严格准时**：cron 实际执行可能延迟数分钟到半小时；仓库连续 60 天无活动时 GitHub 会停用定时任务，需去 Actions 页面重新启用。
- **`base` 需手动对齐**：仓库名为 `用户名.github.io` 时 `base: '/'`；子路径部署需改为 `'/仓库名/'`。

## 📋 版本信息

- **Tag**：`v1.0.0`（附注标签）
- **提交**：`e52c0e0` — `chore: 个人主页 v1.0.0 首个正式版本`
- **变更规模**：29 个文件，+3989 行
- **`package.json` 版本**：统一为 `1.0.0`（含 `package-lock.json`）

## 🔭 后续计划

- `/data` 子页面落地（数据看板 / 归档）。
- 项目卡片支持 README 摘要与 star 数展示。
- 文章列表增加标签筛选与搜索。
