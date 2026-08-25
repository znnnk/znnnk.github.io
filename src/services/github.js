// GitHub API 服务
// 用于动态获取用户的公开仓库列表

const API_BASE = 'https://api.github.com'

/**
 * 获取指定用户的公开仓库列表
 * @param {string} username GitHub 用户名
 * @param {Object} options 选项
 * @param {number} options.per_page 每页数量（最大 100）
 * @param {string} options.sort 排序方式：updated, created, pushed, full_name
 * @returns {Promise<Array>} 仓库列表
 */
export async function fetchUserRepos(username, options = {}) {
  const {
    per_page = 100,
    sort = 'updated',
  } = options

  const url = `${API_BASE}/users/${username}/repos`
  const params = new URLSearchParams({
    per_page,
    sort,
    type: 'owner', // 只显示自己创建的仓库，排除 fork
  })

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API 请求失败: ${response.status}`)
    }

    const repos = await response.json()
    return repos
  } catch (error) {
    console.error('获取 GitHub 仓库失败:', error)
    throw error
  }
}

/**
 * 将 GitHub API 返回的仓库数据转换为项目卡片所需的格式
 * @param {Object} repo GitHub 仓库对象
 * @returns {Object} 标准化的项目对象
 */
export function normalizeRepo(repo) {
  return {
    name: repo.name,
    title: repo.name,
    description: repo.description || '暂无描述',
    tags: repo.topics || [repo.language].filter(Boolean),
    demo: repo.homepage || '',
    highlight: false, // 默认不置顶，可通过白名单设置
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    language: repo.language,
    updatedAt: repo.updated_at,
    url: repo.html_url,
  }
}

/**
 * 获取仓库并转换为展示格式
 * @param {string} username GitHub 用户名
 * @param {Object} options 选项
 * @returns {Promise<Array>} 处理后的项目列表
 */
export async function getProjects(username, options = {}) {
  try {
    const repos = await fetchUserRepos(username, options)
    return repos.map(normalizeRepo)
  } catch (error) {
    console.error('获取项目列表失败:', error)
    return [] // 返回空数组以便上层处理
  }
}
