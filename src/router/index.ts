import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  const title = (to.meta.title as string | undefined) ?? '后台管理'
  document.title = `${title} · lys last dance`

  if (to.meta.public) {
    if (userStore.isLoggedIn && to.name === 'Login') {
      return { path: '/dashboard' }
    }
    return true
  }

  if (!userStore.isLoggedIn) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  return true
})

export default router
