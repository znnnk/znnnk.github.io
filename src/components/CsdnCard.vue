<script setup>
import { computed } from 'vue'
import { siteConfig } from '../data/config.js'

const props = defineProps({
  totalViews: {
    type: Number,
    default: 0,
  },
})

function formatViews(n) {
  if (!n) return ''
  return n.toLocaleString()
}

const displayViews = computed(() => {
  if (props.totalViews > 0) {
    return formatViews(props.totalViews) + ' 浏览量'
  }
  return '加载中...'
})
</script>

<template>
  <div class="csdn-card card-base">
    <div class="csdn-head">
      <span class="csdn-logo">CSDN</span>
      <span class="badge csdn-views">{{ displayViews }}</span>
    </div>
    <p class="csdn-desc">
      我的 CSDN 技术博客主页，长期相关文章，欢迎访问。
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
