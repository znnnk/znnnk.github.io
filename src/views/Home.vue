<script setup>
import { ref, onMounted, computed } from 'vue'
import HeroSection from '../components/HeroSection.vue'
import ProjectCard from '../components/ProjectCard.vue'
import ContributionGraph from '../components/ContributionGraph.vue'
import CsdnCard from '../components/CsdnCard.vue'
import ArticleList from '../components/ArticleList.vue'
import { getProjects } from '../services/github.js'
import { siteConfig } from '../data/config.js'

const projects = ref([])
const loading = ref(true)
const error = ref(null)
const csdnTotalViews = ref(0)

// 预留：手动维护的项目列表（作为兜底或补充）
// 如果希望同时展示手动项目和动态项目，可在此处配置
const manualProjects = ref([
  // 例如：将 myPage 项目置顶
  // { name: 'myPage', title: 'myPage', description: '你现在看到的这个个人主页。', tags: ['Vue 3'], highlight: true }
])

onMounted(async () => {
  try {
    // 从 GitHub API 获取项目
    const dynamicProjects = await getProjects(siteConfig.githubUsername, {
      sort: 'updated',
      per_page: 30,
      exclude: siteConfig.excludeRepos,
    })
    
    // 合并动态和手动项目，手动项目优先
    projects.value = [...manualProjects.value, ...dynamicProjects]
  } catch (e) {
    error.value = e.message || '加载失败'
    console.error('获取项目失败:', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <HeroSection />

    <section class="container section">
      <h2 class="section-title">GitHub项目</h2>
      <p class="section-subtitle">
        前面可是地狱啊！
      </p>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>正在加载项目...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>加载项目失败: {{ error }}</p>
        <p class="hint-text">GitHub API可能达到访问限制，请稍后重试。</p>
      </div>

      <div v-else-if="projects.length === 0" class="empty">
        <p>暂无公开项目</p>
      </div>

      <div v-else class="projects-grid">
        <ProjectCard
          v-for="p in projects"
          :key="p.name + p.updatedAt"
          :project="p"
        />
      </div>
    </section>

    <section class="container section">
      <h2 class="section-title">GitHub 活跃度</h2>
      <p class="section-subtitle">铭记过去是保护未来的方式。</p>
      <ContributionGraph />
    </section>

    <section class="container section">
      <h2 class="section-title">技术博客</h2>
      <p class="section-subtitle">我留下的不只是代码，还有记录。</p>
      <CsdnCard :totalViews="csdnTotalViews" />
      <div class="blog-list card-base">
        <ArticleList @totalViews="csdnTotalViews = $event" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.loading, .error, .empty {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  color: #f87171;
}

.error .hint-text {
  font-size: 13px;
  margin-top: 8px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.blog-list {
  margin-top: 24px;
}

@media (max-width: 720px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
