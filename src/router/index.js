import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

// 使用 hash 模式，避免 GitHub Pages 刷新 404 问题
const routes = [
  { path: '/', name: 'home', component: Home },
  {
    path: '/data',
    name: 'data',
    // 预留：API 数据展示子页面（懒加载）
    component: () => import('../views/DataPage.vue'),
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
