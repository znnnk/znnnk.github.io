<script setup>
import { computed } from 'vue'
import { siteConfig } from '../data/config.js'

const props = defineProps({
  totalViews: {
    type: Number,
    default: 0,
  },
  articleCount: {
    type: Number,
    default: 0,
  },
})

function formatViews(n) {
  if (!n) return ''
  return n.toLocaleString()
}

// CSDN 浏览量接口已强制人机验证，无法自动获取：
// 优先用真实浏览量（若有），其次显示已拉取到的文章数，最后回退到 config 里的静态文案
const displayViews = computed(() => {
  if (props.totalViews > 0) {
    return formatViews(props.totalViews) + ' 浏览量'
  }
  if (props.articleCount > 0) {
    return props.articleCount + ' 篇近期文章'
  }
  return siteConfig.csdnViews || '技术博客'
})
</script>

<template>
  <div class="csdn-card card-base">
    <div class="csdn-head">
      <span class="csdn-logo">CSDN</span>
      <span class="badge csdn-views">{{ displayViews }}</span>
    </div>
    <p class="csdn-desc">
      我的 CSDN 技术博客主页，相关技术文章欢迎访问。
    </p>
    <a
      :href="siteConfig.csdnUrl"
      target="_blank"
      rel="noopener"
      class="card-link"
    >前往主页 →</a>
  </div>
</template>

<style scoped>
.csdn-card {
  height: 100%;
}
.csdn-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.csdn-logo {
  font-weight: 700;
  color: var(--color-text);
}
.csdn-views {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.3);
}
.csdn-desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.5;
}
</style>
