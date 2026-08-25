<script setup>
import { computed } from 'vue'
import { profile, siteConfig } from '../data/config.js'

const githubUrl = computed(
  () => `https://github.com/${siteConfig.githubUsername}`
)
</script>

<template>
  <section class="hero">
    <div class="container hero-inner">
      <h1 class="hero-name">Hello, I'm 「 {{ profile.id }} 」</h1>
      <p class="hero-motto-en">{{ profile.mottoEn }}</p>
      <p class="hero-motto-cn">{{ profile.mottoCn }}</p>

      <div class="hero-actions">
        <a
          :href="githubUrl"
          target="_blank"
          rel="noopener"
          class="btn btn-primary"
        >
          GitHub
        </a>
        <a
          :href="siteConfig.csdnUrl"
          target="_blank"
          rel="noopener"
          class="btn"
        >
          CSDN
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding: 96px 0 64px;
  width: 100%;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 添加一层遮罩，让文字更清晰并与下方内容衔接 */
.hero-inner {
  position: relative;
  text-align: center;
  max-width: 800px;
  padding: 0 24px;
}

.hero-name {
  font-size: 64px;
  font-weight: 800;
  margin: 0 0 16px;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.hero-motto-en {
  font-size: 18px;
  margin: 0 auto 12px;
  max-width: 600px;
  background: linear-gradient(135deg, #ffffff 0%, #8ab4ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-motto-cn {
  font-size: 15px;
  margin: 0 auto 32px;
  max-width: 600px;
  background: linear-gradient(135deg, #c8d8ff 0%, #5b8bff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-actions {
  display: inline-flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero {
    padding: 64px 0 48px;
  }
  .hero-name {
    font-size: 44px;
  }
  .hero-motto-en {
    font-size: 16px;
  }
}
</style>
