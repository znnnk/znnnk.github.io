<script setup>
import { computed, ref } from 'vue'
import { siteConfig } from '../data/config.js'

// 使用第三方 SVG 服务生成贡献热力图（零配置、无需 token）
// 备用源：https://github.com/2016rshah/githubchart-api

// 60 秒节流：60 秒内复用同一时间戳，让浏览器缓存生效，避免每次刷新都向第三方发请求。
// 注意：ghchart.rshah.org 自身有数小时到 1 天的服务端缓存，这是绕不过的。
const CHART_TTL = 60 * 1000
const TS_KEY = 'mypage_contrib_chart_ts'

function getStableTs() {
  try {
    const ts = sessionStorage.getItem(TS_KEY)
    if (ts && Date.now() - Number(ts) < CHART_TTL) {
      return ts
    }
    const now = String(Date.now())
    sessionStorage.setItem(TS_KEY, now)
    return now
  } catch {
    return String(Date.now())
  }
}

const chartSrc = computed(
  () => `https://ghchart.rshah.org/${siteConfig.githubUsername}?t=${getStableTs()}`
)
const fallbackSrc = computed(
  () =>
    `https://github-readme-stats.vercel.app/api?username=${siteConfig.githubUsername}&show_icons=true&count_private=true&t=${getStableTs()}`
)
const failed = ref(false)
</script>

<template>
  <div class="contrib">
    <img
      v-if="!failed"
      :src="chartSrc"
      :alt="`${siteConfig.githubUsername} 的 GitHub 贡献热力图`"
      class="contrib-img"
      @error="failed = true"
      loading="lazy"
    />
    <img
      v-else
      :src="fallbackSrc"
      :alt="`${siteConfig.githubUsername} 的 GitHub 统计`"
      class="contrib-img contrib-fallback"
      loading="lazy"
    />
    <p class="contrib-hint" v-if="!failed">过去一年的 GitHub 贡献活跃度</p>
  </div>
</template>

<style scoped>
.contrib {
  text-align: center;
}
.contrib-img {
  max-width: 100%;
  border-radius: 8px;
}
.contrib-fallback {
  display: inline-block;
}
.contrib-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
