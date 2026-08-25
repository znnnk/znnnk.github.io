# 个人主页

基于 Vue 3 + Vite 的个人主页，部署于 GitHub Pages，零成本、零备案、零运维。

## 功能

- **Hero 区**：姓名、中英文签名、CTA 按钮
- **项目作品**：从 GitHub API 动态拉取公开仓库，按最近更新时间排序
- **GitHub 活跃度**：通过第三方 SVG 服务展示一年贡献热力图
- **技术博客**：CSDN 主页入口卡（实时浏览量）+ 近期文章列表（RSS 拉取 + API 获取浏览量，支持时间/浏览量排序）
- **更多子页面**：`/data` 预留路由，显示"待建设"占位

## 本地开发

```bash
npm install      # 安装依赖（需要 Node 16+，推荐 18+）
npm run dev      # 启动开发服务器 http://localhost:5173
npm run build    # 构建到 dist/
npm run preview  # 本地预览构建产物
```

## 配置你的信息（必做）

打开 [src/data/config.js](src/data/config.js) 替换以下占位符：

| 字段 | 说明 |
|------|------|
| `githubUsername` | GitHub 用户名，用于生成仓库链接与贡献热力图 |
| `csdnUrl` | CSDN 主页完整链接，例如 `https://blog.csdn.net/your_id` |
| `csdnId` | CSDN ID（主页 URL 末段），用于拉取 RSS 文章 |
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
> `vite.config.js` 中 `base: './'` 为相对路径，兼容任意子路径部署，配合 hash 路由无需额外配置。

### 方式 B：本地 `gh-pages` 一键推送

```bash
npm run deploy
```

该脚本会构建并将 `dist/` 推送到 `gh-pages` 分支，随后在仓库 Settings → Pages 中将 Source 设为 `gh-pages` 分支根目录。

## 目录结构

```
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
│   └── articles.js    # 文章示例数据（动态拉取失败时回退）
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

CSDN 无官方公开 JSON API，本站通过两个渠道组合获取完整文章信息：

- **RSS 代理**：`https://api.rss2json.com/v1/api.json?rss_url=<rss_url>` → 获取文章标题、链接、发布日期
- **CSDN 社区 API**（经 CORS 代理转发）→ 获取文章浏览量等元数据
- 两个数据源通过 URL 匹配合并，最终展示标题 + 日期 + 浏览量
- 浏览量支持「按时间」和「按浏览量」两种排序切换
- CSDN 卡片展示的总浏览量由所有文章浏览量累加实时计算
- 若拉取失败会自动回退到 `src/data/articles.js` 中的示例数据，页面不会空白

## 技术栈

- Vue 3（Composition API + `<script setup>`）
- Vite 4
- Vue Router 4（hash 模式，规避 GitHub Pages 刷新 404）
- 纯 CSS（无 UI 框架，体积小、加载快、支持暗色模式）
