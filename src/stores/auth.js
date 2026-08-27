import { defineStore } from 'pinia'
import { authService } from '../services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user_info') || 'null'),
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isInterno: (state) => state.user?.tipo_acesso === 'interno',
    isCliente: (state) => state.user?.tipo_acesso === 'cliente',
    username: (state) => state.user?.username || '',
    userEmail: (state) => state.user?.email || '',
    tipoAcesso: (state) => state.user?.tipo_acesso || '',
  },

  actions: {
    async login(username, password) {
      this.loading = true
      this.error = null
      try {
        const data = await authService.login(username, password)
        
        this.accessToken = data.access
        this.refreshToken = data.refresh
        this.user = data.user || null

        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        if (data.user) {
          localStorage.setItem('user_info', JSON.stringify(data.user))
        }

        // Se o backend não enviou user direto no login, busca em /auth/me/
        if (!this.user) {
          await this.fetchCurrentUser()
        }

        return data
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          'Falha na autenticação. Verifique suas credenciais.'
        this.error = errorMsg
        throw new Error(errorMsg)
      } finally {
        this.loading = false
      }
    },

    async fetchCurrentUser() {
      if (!this.accessToken) return null
      try {
        const userData = await authService.getMe()
        this.user = userData
        localStorage.setItem('user_info', JSON.stringify(userData))
        return userData
      } catch (err) {
        if (err.response && err.response.status === 401) {
          this.logout()
        }
        return null
      }
    },

    async registro(dados) {
      this.loading = true
      this.error = null
      try {
        const data = await authService.registro(dados)
        return data
      } catch (err) {
        const errorMsg =
          err.response?.data?.username?.[0] ||
          err.response?.data?.email?.[0] ||
          err.response?.data?.password?.[0] ||
          err.response?.data?.detail ||
          'Erro ao realizar cadastro.'
        this.error = errorMsg
        throw new Error(errorMsg)
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.error = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_info')
    }
  }
})
