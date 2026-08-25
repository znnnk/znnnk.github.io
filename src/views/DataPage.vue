<script setup>
// 更多页面 - 待建设
</script>

<template>
  <section class="container section">
    <div class="placeholder">
      <div class="placeholder-icon">🚧</div>
      <h3>待建设</h3>
      <p class="placeholder-text">此页面正在规划中，敬请期待。</p>
      <router-link to="/" class="btn">返回首页</router-link>
    </div>
  </section>
</template>

<style scoped>
.placeholder {
  text-align: center;
  padding: 80px 24px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}
.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.placeholder h3 {
  margin: 0 0 12px;
  font-size: 20px;
}
.placeholder-text {
  color: var(--color-text-muted);
  font-size: 14px;
  margin: 0 0 24px;
}
</style>
