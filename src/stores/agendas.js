import { defineStore } from 'pinia'
import { agendaService } from '../services/agendaService'

export const useAgendaStore = defineStore('agendas', {
  state: () => ({
    agendas: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalAgendas: (state) => state.agendas.length,
  },

  actions: {
    async carregarAgendas(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await agendaService.getAgendas(params)
        this.agendas = Array.isArray(data) ? data : (data.results || [])
        return this.agendas
      } catch (err) {
        this.error = err.response?.data?.detail || 'Erro ao carregar agendas.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async criarAgenda(dados) {
      this.loading = true
      this.error = null
      try {
        const nova = await agendaService.criarAgenda(dados)
        this.agendas.push(nova)
        return nova
      } catch (err) {
        const errorMsg =
          err.response?.data?.hora_encerramento?.[0] ||
          err.response?.data?.hora_encerramento ||
          err.response?.data?.vagas_por_dia?.[0] ||
          err.response?.data?.vagas_por_dia ||
          err.response?.data?.dias_semana?.[0] ||
          err.response?.data?.dias_semana ||
          err.response?.data?.especialista?.[0] ||
          err.response?.data?.detail ||
          'Erro ao criar agenda.'
        this.error = typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },

    async excluirAgenda(id) {
      this.loading = true
      this.error = null
      try {
        await agendaService.excluirAgenda(id)
        this.agendas = this.agendas.filter(a => a.id !== id)
      } catch (err) {
        this.error = err.response?.data?.detail || 'Erro ao excluir agenda.'
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})
