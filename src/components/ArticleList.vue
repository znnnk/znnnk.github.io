<script setup>
import { onMounted, ref, computed, watchEffect } from 'vue'
import { siteConfig } from '../data/config.js'
import { fallbackArticles } from '../data/articles.js'

const emit = defineEmits(['totalViews', 'count'])

const articles = ref([])
const loading = ref(true)
const failed = ref(false)
const sortBy = ref('time') // 'time' | 'views'

function formatViews(n) {
  if (!n) return '0'
  return n.toLocaleString()
}

const sortedArticles = computed(() => {
  const list = [...articles.value]
  if (sortBy.value === 'views') {
    // 按浏览量降序
    list.sort((a, b) => (b.views || 0) - (a.views || 0))
  } else {
    // 按时间降序（默认）
    list.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
  }
  return list
})

const totalViews = computed(() => {
  return articles.value.reduce((sum, a) => sum + (a.views || 0), 0)
})

// 没有浏览量数据时隐藏「按浏览量」排序
const hasViews = computed(() => articles.value.some((a) => a.views > 0))

// 数据源优先级：
// 1) data/articles.json —— 由 GitHub Actions 每天生成并提交的同源静态文件（最可靠）
// 2) rss2json —— 实测响应带 Access-Control-Allow-Origin: *，可跨域直接 fetch
// 已移除 corsproxy.io / allorigins / codetabs 三个代理：分别返回 401 / 522 / 522，均已失效；
// CSDN 的 home-api（文章浏览量）强制人机验证，浏览器端无法直接请求；
// 浏览量由 GitHub Actions 带 Cookie 抓取后写进 data/articles.json，前端直接读。
const STATIC_JSON = `${import.meta.env.BASE_URL}data/articles.json`
// 静态数据由定时任务生成，超过这个时长没更新就认为它已过期，回退到 RSS
const MAX_STALE = 3 * 24 * 60 * 60 * 1000

async function fetchStaticJson() {
  const res = await fetch(STATIC_JSON)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (!Array.isArray(data.items)) throw new Error('静态数据格式异常')
  return data
}

async function fetchFromRss() {
  const rssUrl = `https://blog.csdn.net/${siteConfig.csdnId}/rss/list`
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 10000)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data.status !== 'ok' || !Array.isArray(data.items)) {
      throw new Error(data.message || 'RSS 解析失败')
    }
    return data.items.map((it) => ({
      title: it.title,
      url: it.link,
      publishedAt: (it.pubDate || '').slice(0, 10),
      views: 0, // CSDN 未公开可跨域的浏览量接口
    }))
  } finally {
    clearTimeout(timer)
  }
}

function toArticles(data) {
  return data.items.map((it) => ({
    title: it.title,
    url: it.url || it.link,
    publishedAt: it.publishedAt || '',
    views: it.views || 0,
  }))
}

async function loadArticles() {
  try {
    const data = await fetchStaticJson()
    const fresh =
      data.updatedAt && Date.now() - Date.parse(data.updatedAt) < MAX_STALE
    if (fresh) return toArticles(data)
    console.warn('[文章] 静态数据已过期，回退 rss2json')
  } catch (e) {
    console.warn('[文章] 静态数据不可用，回退 rss2json:', e.message)
  }
  return fetchFromRss()
}

// 6 小时缓存：RSS 更新频率低，且 rss2json 免费额度有限，避免每次访问都请求
const CACHE_KEY = 'mypage_csdn_articles_cache'
const CACHE_TTL = 6 * 60 * 60 * 1000
const DISABLE_CACHE = false // 调试开关：true 时禁用缓存，每次刷新都重新拉取

function readCache(key) {
  if (DISABLE_CACHE) return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts < CACHE_TTL) {
      return { data, fresh: true }
    }
    return { data, fresh: false }
  } catch {
    return null
  }
}

function writeCache(key, data) {
  if (DISABLE_CACHE) return
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    // 忽略写入失败
  }
}

onMounted(async () => {
  if (!siteConfig.csdnId || siteConfig.csdnId === 'YOUR_CSDN_ID') {
    articles.value = fallbackArticles
    loading.value = false
    return
  }

  // 命中缓存直接使用，不再发请求
  const cached = readCache(CACHE_KEY)
  if (cached?.fresh && Array.isArray(cached.data)) {
    articles.value = cached.data
    loading.value = false
    return
  }

  try {
    const list = await loadArticles()
    writeCache(CACHE_KEY, list)
    articles.value = list
  } catch (e) {
    failed.value = true
    // 失败时回退到过期缓存（若有），其次静态兜底数据
    if (cached?.data) {
      articles.value = cached.data
    } else {
      articles.value = fallbackArticles
    }
  } finally {
    loading.value = false
  }
})

watchEffect(() => {
  if (articles.value.length) {
    emit('count', articles.value.length)
  }
  if (totalViews.value > 0) {
    emit('totalViews', totalViews.value)
  }
})
</script>

<template>
  <div>
    <div class="list-header">
      <h3 class="list-title">近期文章</h3>
      <div class="sort-toggle">
        <button
          class="sort-btn"
          :class="{ active: sortBy === 'time' }"
          @click="sortBy = 'time'"
        >
          按时间
        </button>
        <button
          v-if="hasViews"
          class="sort-btn"
          :class="{ active: sortBy === 'views' }"
          @click="sortBy = 'views'"
        >
          按浏览量
        </button>
      </div>
    </div>

    <p v-if="loading" class="hint">正在加载最新文章…</p>
    <p v-else-if="failed" class="hint">
      文章列表拉取失败，已显示示例数据。
    </p>
    <ul class="list">
      <li v-for="a in sortedArticles.slice(0, 10)" :key="a.url" class="item">
        <a
          :href="a.url"
          target="_blank"
          rel="noopener"
          class="item-title"
        >
          {{ a.title }}
        </a>
        <span class="item-meta">
          <span v-if="a.publishedAt" class="date">{{ a.publishedAt }}</span>
          <span v-if="a.views > 0" class="views" :title="a.views + ' 浏览'">
            👁 {{ formatViews(a.views) }}
          </span>
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.list-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.sort-toggle {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.sort-btn {
  padding: 4px 12px;
  font-size: 12px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.sort-btn:hover {
  color: var(--color-text);
}

.sort-btn.active {
  background: var(--color-primary);
  color: #fff;
}

.hint {
  color: var(--color-text-muted);
  font-size: 13px;
  margin: 0 0 12px;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.item {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}
.item:last-child {
  border-bottom: none;
}
.item-title {
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-title:hover {
  color: var(--color-primary);
}
.item-meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-muted);
  font-size: 12px;
  flex-shrink: 0;
}
.views {
  color: var(--color-primary);
  font-weight: 500;
}
.date {
  color: var(--color-text-muted);
}
</style>
