import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages 部署需要 base 路径
//仓库名为 username.github.io 时 base 为 '/'
// 仓库名为其他（如 mypage）时 base 为 '/mypage/'
// 见 README 中"部署到 GitHub Pages"一节
export default defineConfig({
  plugins: [vue()],
  base: '/',
})
