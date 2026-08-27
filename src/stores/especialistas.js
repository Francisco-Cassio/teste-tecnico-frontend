import { defineStore } from 'pinia'
import { especialistaService } from '../services/especialistaService'

export const useEspecialistaStore = defineStore('especialistas', {
  state: () => ({
    especialistas: [],
    loading: false,
    error: null,
  }),

  getters: {
    especialidades: (state) => {
      const lista = state.especialistas.map(e => e.especialidade)
      return [...new Set(lista)].filter(Boolean).sort()
    },
    totalEspecialistas: (state) => state.especialistas.length,
    getPorId: (state) => (id) => state.especialistas.find(e => e.id === Number(id)),
  },

  actions: {
    async carregarEspecialistas(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await especialistaService.getEspecialistas(params)
        this.especialistas = Array.isArray(data) ? data : (data.results || [])
        return this.especialistas
      } catch (err) {
        this.error = err.response?.data?.detail || 'Erro ao carregar especialistas.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async criarEspecialista(dados) {
      this.loading = true
      this.error = null
      try {
        const novo = await especialistaService.criarEspecialista(dados)
        this.especialistas.push(novo)
        return novo
      } catch (err) {
        const errorMsg =
          err.response?.data?.email?.[0] ||
          err.response?.data?.nome?.[0] ||
          err.response?.data?.detail ||
          'Erro ao cadastrar especialista.'
        this.error = errorMsg
        throw new Error(errorMsg)
      } finally {
        this.loading = false
      }
    },

    async atualizarEspecialista(id, dados) {
      this.loading = true
      this.error = null
      try {
        const atualizado = await especialistaService.atualizarEspecialista(id, dados)
        const index = this.especialistas.findIndex(e => e.id === id)
        if (index !== -1) {
          this.especialistas[index] = atualizado
        }
        return atualizado
      } catch (err) {
        const errorMsg =
          err.response?.data?.email?.[0] ||
          err.response?.data?.nome?.[0] ||
          err.response?.data?.detail ||
          'Erro ao atualizar especialista.'
        this.error = errorMsg
        throw new Error(errorMsg)
      } finally {
        this.loading = false
      }
    },

    async excluirEspecialista(id) {
      this.loading = true
      this.error = null
      try {
        await especialistaService.excluirEspecialista(id)
        this.especialistas = this.especialistas.filter(e => e.id !== id)
      } catch (err) {
        this.error = err.response?.data?.detail || 'Erro ao excluir especialista.'
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})
