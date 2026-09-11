// 由 .github/workflows/refresh-data.yml 每天定时执行。
// 抓取 CSDN 文章（含浏览量），写入 public/data/articles.json；前端优先读取这个同源静态文件，
// 从而不依赖跨域与第三方代理。失败时保留上次生成的文件，不以失败退出。

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { siteConfig } from '../src/data/config.js'

const OUT_DIR = new URL('../public/data/', import.meta.url)
const TIMEOUT = 20000
// 带浏览器风格的头即可匿名返回 JSON（实测无需登录态）；缺 Referer/Accept 会被当爬虫拦下
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Referer: `https://blog.csdn.net/${siteConfig.csdnId}`,
  Accept: 'application/json, text/plain, */*',
}

async function getJson(url, headers) {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// 归一化 URL 用于匹配：忽略协议/尾斜杠/大小写差异
function normUrl(u) {
  return String(u || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
}

// 主数据源：CSDN 主页接口，一次返回全部文章（含 viewCount）
async function fetchFromApi() {
  const api =
    `https://blog.csdn.net/community/home-api/v1/get-business-list` +
    `?page=1&size=100&businessType=blog&orderby=&no498=true&username=${siteConfig.csdnId}`
  const data = await getJson(api, BROWSER_HEADERS)
  const list = data?.data?.list
  if (!Array.isArray(list) || !list.length) {
    throw new Error('未返回文章列表（疑似触发人机验证）')
  }
  console.log(`· 接口返回 ${list.length} 篇（含浏览量）`)
  return list.map((it) => ({
    title: (it.title || '').trim(),
    url:
      it.url ||
      `https://blog.csdn.net/${siteConfig.csdnId}/article/details/${it.articleId}`,
    publishedAt: (it.postTime || '').slice(0, 10),
    views: Number(it.viewCount) || 0,
  }))
}

// 兜底数据源：RSS，只有最近 10 篇且没有浏览量
async function fetchFromRss() {
  const rss = `https://blog.csdn.net/${siteConfig.csdnId}/rss/list`
  const data = await getJson(
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`
  )
  if (data.status !== 'ok' || !Array.isArray(data.items)) {
    throw new Error(data.message || 'RSS 解析失败')
  }
  return data.items.map((it) => ({
    title: it.title,
    url: it.link,
    publishedAt: (it.pubDate || '').slice(0, 10),
    views: 0,
  }))
}

// 接口被风控时的兜底：读上次存档的 articles.json，按 URL 补回浏览量
async function readPrevViews() {
  try {
    const data = JSON.parse(await readFile(new URL('articles.json', OUT_DIR), 'utf8'))
    const map = new Map()
    for (const it of data.items || []) {
      if (it?.views > 0) map.set(normUrl(it.url), it.views)
    }
    return map
  } catch {
    return new Map()
  }
}

async function fetchArticles() {
  try {
    return { updatedAt: new Date().toISOString(), items: await fetchFromApi() }
  } catch (e) {
    console.warn(`· 接口不可用（${e.message}），回退 RSS`)
  }

  let items
  try {
    items = await fetchFromRss()
  } catch (e) {
    throw new Error(`RSS 也失败：${e.message}`)
  }

  const prev = await readPrevViews()
  if (prev.size) {
    for (const it of items) it.views = prev.get(normUrl(it.url)) || 0
    console.warn(`· 已从上次存档补回 ${prev.size} 篇浏览量`)
  } else {
    console.warn('· 浏览量获取失败，本次仅更新文章列表')
  }
  return { updatedAt: new Date().toISOString(), items }
}

async function save(name, getter) {
  try {
    const data = await getter()
    await writeFile(new URL(name, OUT_DIR), JSON.stringify(data))
    console.log(`✔ ${name} 已更新（${data.items.length} 篇）`)
  } catch (e) {
    console.warn(`✘ ${name} 更新失败，保留旧数据：${e.message}`)
  }
}

await mkdir(OUT_DIR, { recursive: true })
if (siteConfig.csdnId) await save('articles.json', fetchArticles)
