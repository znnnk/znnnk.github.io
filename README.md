# 个人主页

基于 Vue 3 + Vite 的个人主页，部署于 GitHub Pages，零成本、零备案、零运维。

## 功能

- **Hero 区**：姓名、中英文签名、CTA 按钮
- **项目作品**：从 GitHub API 动态拉取公开仓库，按最近更新时间排序
- **GitHub 活跃度**：通过第三方 SVG 服务展示一年贡献热力图
- **技术博客**：CSDN 主页入口卡（文章总数/总浏览量）+ 文章列表（含单篇浏览量，支持时间/浏览量排序）
- **数据自动更新**：GitHub Actions 每天抓取 CSDN 文章与浏览量，写入 `public/data/articles.json`，前端读同源文件
- **更多子页面**：`/data` 预留路由，显示"待建设"占位

## 本地开发

```bash
npm install      # 安装依赖（需要 Node 18+）
npm run dev      # 启动开发服务器 http://localhost:5173
npm run build    # 构建到 dist/
npm run preview  # 本地预览构建产物
node scripts/fetch-data.mjs   # 手动跑一次数据抓取（生成 public/data/articles.json）
```

## 配置你的信息（必做）

打开 [src/data/config.js](src/data/config.js) 替换以下占位符：

| 字段 | 说明 |
|------|------|
| `githubUsername` | GitHub 用户名，用于生成仓库链接与贡献热力图 |
| `csdnUrl` | CSDN 主页完整链接，例如 `https://blog.csdn.net/your_id` |
| `csdnId` | CSDN ID（主页 URL 末段），用于抓取文章列表与浏览量 |
| `profile.id` | 展示用的 ID |
| `profile.mottoEn` | 英文签名 |
| `profile.mottoCn` | 中文签名 |

项目作品通过 GitHub API 动态拉取，默认展示公开仓库中最近更新的项目。如需固定置顶某个项目，可在 `src/views/Home.vue` 的 `manualProjects` 数组中添加。

## 部署到 GitHub Pages

### 方式 A：GitHub Actions 自动部署（推荐）

1. 在 GitHub 新建仓库，仓库名建议为 `你的用户名.github.io`（访问地址即 `https://你的用户名.github.io`）；也可任意命名（访问地址为 `https://你的用户名.github.io/仓库名`）。
2. 推送代码到 `main` 分支：
   ```bash
   git init
   git add .
   git commit -m "init: 个人主页"
   git branch -M main
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```
3. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
4. 推送即自动构建部署，几分钟后访问 Pages URL 即可。

> 已配置 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)，使用 Node 18 构建。
> `vite.config.js` 中 `base` 当前为 `'/'`，对应仓库名 `你的用户名.github.io`；若部署到子路径（如 `mypage`），需改为 `'/mypage/'`。
> 路由使用 hash 模式，无需额外的 Pages 404 配置。

### 方式 B：本地 `gh-pages` 一键推送

```bash
npm run deploy
```

该脚本会构建并将 `dist/` 推送到 `gh-pages` 分支，随后在仓库 Settings → Pages 中将 Source 设为 `gh-pages` 分支根目录。

## 目录结构

```
.github/workflows/
├── deploy.yml          # push 到 main 时构建部署到 Pages
└── refresh-data.yml    # 每天定时抓数据并提交，再触发 deploy.yml
public/
└── data/
    └── articles.json   # 定时任务生成的 CSDN 文章数据（前端读取）
scripts/
└── fetch-data.mjs      # 数据抓取脚本（Node 内置 fetch，无额外依赖）
src/
├── components/         # 组件
│   ├── TheHeader.vue
│   ├── TheFooter.vue
│   ├── HeroSection.vue
│   ├── ProjectCard.vue
│   ├── ContributionGraph.vue
│   ├── CsdnCard.vue
│   └── ArticleList.vue
├── data/               # 数据源与配置
│   ├── config.js       # 站点与个人信息配置
│   └── articles.js     # 文章示例数据（动态拉取失败时回退）
├── router/index.js     # 路由（hash 模式）
├── services/github.js  # GitHub API 请求封装
├── styles/main.css     # 全局样式与主题变量
├── views/
│   ├── Home.vue        # 首页
│   └── DataPage.vue    # 预留：更多子页面
├── App.vue
└── main.js
```

## 关于 CSDN 文章拉取

CSDN 无官方公开 JSON API，且其接口带 WAF，浏览器端无法直接跨域请求。本站的做法是**由 GitHub Actions 定时在服务端抓取，落盘成同源 JSON，前端只读本地文件**：

```
scripts/fetch-data.mjs ──→ public/data/articles.json ──→ 前端 ArticleList.vue / CsdnCard.vue
```

抓取优先级：

1. **CSDN 社区 API（主源）**：`/community/home-api/v1/get-business-list`，一次返回全部文章（`data.total` 为总数），含标题、链接、发布时间、浏览量。需带 `User-Agent` + `Referer` + `Accept` 头，**匿名即可，不需要 Cookie**。
2. **RSS 代理（兜底）**：`api.rss2json.com` 解析 CSDN RSS，**只有最近 10 篇且没有浏览量**。
3. 两者都失败时保留上一次的 `articles.json`，脚本不以失败退出，页面照常有数据。

前端侧：

- 优先读 `public/data/articles.json`；超过 3 天未更新视为过期，回退到 rss2json 实时拉取。
- 拉取全部失败时回退到 `src/data/articles.js` 的示例数据，页面不会空白。
- 浏览量支持「按时间」和「按浏览量」两种排序；若无浏览量数据，排序按钮自动隐藏。
- CSDN 卡片优先显示总浏览量，其次显示文章篇数。
- 本地有 6 小时 localStorage 缓存，调试时可在 `ArticleList.vue` 里把 `DISABLE_CACHE` 设为 `true`。

## 数据自动更新

[`.github/workflows/refresh-data.yml`](.github/workflows/refresh-data.yml) 每天 UTC 22:00（北京时间次日 6:00）执行，也可在 Actions 页面手动 `Run workflow`：

1. 跑 `scripts/fetch-data.mjs` 生成 `public/data/articles.json`；
2. 有变化则自动提交（无变化跳过，不产生空 commit）；
3. 提交后显式调用 `gh workflow run deploy.yml` 重新部署——`GITHUB_TOKEN` 推送的 commit 不会自动触发其他 workflow，这一步不能省。

两点限制：cron 实际执行可能延迟几分钟到半小时；仓库连续 60 天无活动时 GitHub 会停用定时任务，需去 Actions 页面重新启用。

## 技术栈

- Vue 3（Composition API + `<script setup>`）
- Vite 4
- Vue Router 4（hash 模式，规避 GitHub Pages 刷新 404）
- 纯 CSS（无 UI 框架，体积小、加载快、支持暗色模式）
