import api from './api'

export const authService = {
  async login(username, password) {
    const response = await api.post('/token/', { username, password })
    return response.data
  },

  async getMe() {
    const response = await api.get('/auth/me/')
    return response.data
  },

  async registro(dados) {
    const response = await api.post('/auth/registro/', dados)
    return response.data
  },

  async refreshToken(refreshToken) {
    const response = await api.post('/token/refresh/', { refresh: refreshToken })
    return response.data
  }
}