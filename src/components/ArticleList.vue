<script setup>
import { onMounted, ref, computed, watchEffect } from 'vue'
import { siteConfig } from '../data/config.js'
import { fallbackArticles } from '../data/articles.js'

const emit = defineEmits(['totalViews'])

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

async function fetchFromCsdnApi() {
  const apiUrl = `https://blog.csdn.net/community/home-api/v1/get-business-list?page=1&size=100&businessType=blog&orderby=&no498=true&username=${siteConfig.csdnId}`
  
  const proxies = [
    (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`,
  ]
  
  let lastError = null
  for (const buildUrl of proxies) {
    try {
      const proxyUrl = buildUrl(apiUrl)
      const res = await fetch(proxyUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      const data = JSON.parse(text)
      
      if (data?.data?.list && Array.isArray(data.data.list)) {
        return data.data.list.map((item) => ({
          title: item.title?.replace(/<[^>]+>/g, '') || '无标题',
          url: item.url || `https://blog.csdn.net/${siteConfig.csdnId}/article/details/${item.id}`,
          publishedAt: '',
          views: item.viewCount || 0,
        }))
      }
      lastError = new Error('返回格式异常')
    } catch (e) {
      lastError = e
    }
  }
  throw lastError || new Error('所有代理均失败')
}

async function fetchFromRss() {
  const rssUrl = `https://blog.csdn.net/${siteConfig.csdnId}/rss/list`
  const proxy = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`
  const res = await fetch(proxy)
  const data = await res.json()
  if (data.status === 'ok' && Array.isArray(data.items)) {
    return data.items.slice(0, 10).map((it) => ({
      title: it.title,
      url: it.link,
      publishedAt: (it.pubDate || '').slice(0, 10),
      views: 0,
    }))
  }
  throw new Error('RSS 解析失败')
}

// 60 秒节流：避免频繁刷新打爆 CSDN 代理服务（corsproxy.io 等会被封禁）
// 调试期：临时禁用节流，每次刷新都重新拉取
const CACHE_KEY = 'mypage_csdn_articles_cache'
const CACHE_TTL = 60 * 1000 // 60 秒
const DISABLE_CACHE = false // 调试期开关：true 时禁用节流，每次刷新都重新拉取

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

// 拉取并合并 RSS + API 数据
async function fetchArticles() {
  const rssList = await fetchFromRss()
  let apiList = []
  try {
    apiList = await fetchFromCsdnApi()
  } catch (e) {
    // API 失败时降级为纯 RSS 数据
  }
  if (apiList.length > 0) {
    const apiMap = new Map(apiList.map(a => [a.url, a]))
    return rssList.map(rssItem => {
      const apiItem = apiMap.get(rssItem.url)
      return {
        ...rssItem,
        views: apiItem?.views || 0,
        title: apiItem?.title || rssItem.title,
      }
    })
  }
  return rssList
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
    const list = await fetchArticles()
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
      <li v-for="a in sortedArticles.slice(0, 8)" :key="a.url" class="item">
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
