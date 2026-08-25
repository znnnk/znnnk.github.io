<script setup>
import { computed, ref } from 'vue'
import { siteConfig } from '../data/config.js'

// 使用第三方 SVG 服务生成贡献热力图（零配置、无需 token）
// 备用源：https://github.com/2016rshah/githubchart-api
const chartSrc = computed(
  () => `https://ghchart.rshah.org/${siteConfig.githubUsername}`
)
const fallbackSrc = computed(
  () =>
    `https://github-readme-stats.vercel.app/api?username=${siteConfig.githubUsername}&show_icons=true&count_private=true`
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
