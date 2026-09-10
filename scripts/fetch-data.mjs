// 由 .github/workflows/refresh-data.yml 每天定时执行。
// 抓取 CSDN 文章，写入 public/data/articles.json；前端优先读取这个同源静态文件，
// 从而不依赖跨域与第三方代理。失败时保留上次生成的文件，不以失败退出。

import { mkdir, writeFile } from 'node:fs/promises'
import { siteConfig } from '../src/data/config.js'

const OUT_DIR = new URL('../public/data/', import.meta.url)
const TIMEOUT = 20000

async function getJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function fetchArticles() {
  const rss = `https://blog.csdn.net/${siteConfig.csdnId}/rss/list`
  const data = await getJson(
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`
  )
  if (data.status !== 'ok' || !Array.isArray(data.items)) {
    throw new Error(data.message || 'RSS 解析失败')
  }
  return {
    updatedAt: new Date().toISOString(),
    items: data.items.map((it) => ({
      title: it.title,
      url: it.link,
      publishedAt: (it.pubDate || '').slice(0, 10),
    })),
  }
}

async function save(name, getter) {
  try {
    const data = await getter()
    await writeFile(new URL(name, OUT_DIR), JSON.stringify(data))
    console.log(`✔ ${name} 已更新`)
  } catch (e) {
    console.warn(`✘ ${name} 更新失败，保留旧数据：${e.message}`)
  }
}

await mkdir(OUT_DIR, { recursive: true })
if (siteConfig.csdnId) await save('articles.json', fetchArticles)
