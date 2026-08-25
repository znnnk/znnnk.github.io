<script setup>
import { computed } from 'vue'
import { profile, siteConfig } from '../data/config.js'

const githubUrl = computed(
  () => `https://github.com/${siteConfig.githubUsername}`
)
const csdnUrl = computed(() => siteConfig.csdnUrl)
</script>

<template>
  <header class="header">
    <div class="container header-inner">
      <router-link to="/" class="logo">{{ profile.id }}</router-link>
      <nav class="nav">
        <a :href="githubUrl" target="_blank" rel="noopener">GitHub</a>
        <a :href="csdnUrl" target="_blank" rel="noopener">CSDN</a>
        <router-link to="/data">更多</router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}
.logo {
  font-weight: 700;
  font-size: 16px;
  color: var(--color-text);
}
.nav {
  display: flex;
  gap: 22px;
  font-size: 14px;
}
.nav a {
  color: var(--color-text-muted);
}
.nav a:hover {
  color: var(--color-primary);
}
</style>
