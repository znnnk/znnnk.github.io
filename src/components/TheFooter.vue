<script setup>
import { profile, siteConfig } from '../data/config.js'
import { computed } from 'vue'

const githubUrl = computed(
  () => `https://github.com/${siteConfig.githubUsername}`
)
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container footer-inner">
      <span>© {{ year }} {{ profile.id }}</span>
      <span class="dot">·</span>
      <a :href="githubUrl" target="_blank" rel="noopener">GitHub</a>
      <span class="dot">·</span>
      <a :href="siteConfig.csdnUrl" target="_blank" rel="noopener">CSDN</a>
      <span class="dot">·</span>
      <span>由 GitHub Pages 提供</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--color-border);
  padding: 24px 0;
  color: var(--color-text-muted);
  font-size: 13px;
}
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}
.dot {
  opacity: 0.5;
}
</style>
