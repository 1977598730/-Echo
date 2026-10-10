import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 无需登录即可访问 */
    public?: boolean
    /** 浏览器标题与顶栏标题 */
    title?: string
  }
}

export {}
