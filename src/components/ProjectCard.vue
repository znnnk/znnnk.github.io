<script setup>
import { computed } from 'vue'
import { siteConfig } from '../data/config.js'

const props = defineProps({
  project: { type: Object, required: true },
})

const langColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Shell: '#89e051',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
}

const getLangColor = (lang) => langColors[lang] || '#8b9bc4'

const repoUrl = computed(() => {
  if (props.project.url) return props.project.url
  return `https://github.com/${siteConfig.githubUsername}/${props.project.name}`
})
</script>

<template>
  <article class="card card-base" :class="{ 'card-highlight': project.highlight }">
    <div class="card-head">
      <a :href="repoUrl" target="_blank" rel="noopener" class="card-title">
        {{ project.title }}
      </a>
      <span v-if="project.highlight" class="badge badge-star">精选</span>
    </div>
    <p class="card-desc">{{ project.description }}</p>
    
    <div v-if="project.tags && project.tags.length" class="card-tags">
      <span v-for="t in project.tags" :key="t" class="tag">{{ t }}</span>
    </div>
    
    <div class="card-meta">
      <span v-if="project.stars !== undefined" class="meta-item">
        ⭐ {{ project.stars }}
      </span>
      <span v-if="project.forks !== undefined" class="meta-item">
        🍴 {{ project.forks }}
      </span>
      <span v-if="project.language" class="meta-item">
        <span class="lang-dot" :style="{ backgroundColor: getLangColor(project.language) }"></span>
        {{ project.language }}
      </span>
    </div>

    <div class="card-foot">
      <a :href="repoUrl" target="_blank" rel="noopener" class="card-link">
        github仓库 →
      </a>
      <a
        v-if="project.demo"
        :href="project.demo"
        target="_blank"
        rel="noopener"
        class="card-link"
      >
        在线 Demo →
      </a>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.card-highlight {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.card-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
}
.card-title:hover {
  color: var(--color-primary);
}
.badge-star {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
.card-desc {
  margin: 0 0 14px;
  font-size: 14px;
  color: var(--color-text-muted);
  flex: 1;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-tags {
  margin-bottom: 12px;
}
.card-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--color-text-muted);
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.lang-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-text-muted);
}
.card-foot {
  display: flex;
  gap: 18px;
  font-size: 13px;
  margin-top: auto;
}
</style>
