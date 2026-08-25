// ============================================================
// 项目列表 - 手动维护，想展示的放前面
// 字段说明：
//   name        仓库名（链接到 GitHub）
//   title       展示标题
//   description 一句话说明这个项目是什么 / 为什么做
//   tags        标签
//   demo        在线 Demo 链接（可选，留空字符串则不显示按钮）
//   highlight   是否置顶
// ============================================================

export const projects = [
  {
    name: 'myPage',
    title: 'myPage',
    description:
      '你现在看到的这个个人主页。Vue 3 + Vite，托管在 GitHub Pages，零成本零运维。',
    tags: ['Vue 3', 'Vite', 'GitHub Pages'],
    demo: '',
    highlight: true,
  },
  {
    name: 'your-repo-name',
    title: '示例：替换为你的项目',
    description:
      '把这条改成你自己的项目即可。description 写清楚它是什么、解决什么问题就够了。',
    tags: ['示例'],
    demo: '',
    highlight: false,
  },
]
