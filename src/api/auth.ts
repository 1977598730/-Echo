import type { LoginPayload, LoginResult } from '../types/user'

/** 演示账号：admin / 123456，后续可替换为 request.post('/auth/login') */
export function loginApi(payload: LoginPayload): Promise<LoginResult> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      const username = payload.username.trim()
      if (username === 'admin' && payload.password === '123456') {
        resolve({
          token: `mock-token-${Date.now()}`,
          user: {
            id: 1,
            username: 'admin',
            nickname: '系统管理员',
          },
        })
        return
      }
      reject(new Error('用户名或密码错误'))
    }, 600)
  })
}
