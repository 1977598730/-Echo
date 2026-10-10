export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar?: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  user: UserInfo
}
