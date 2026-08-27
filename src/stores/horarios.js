import { defineStore } from 'pinia'
import { horarioService } from '../services/horarioService'

export const useHorarioStore = defineStore('horarios', {
  state: () => ({
    horarios: [],
    minhasConsultas: [],
    filtros: {
      especialista_id: '',
      data_consulta: '',
      status: 'disponivel',
    },
    loading: false,
    loadingActionId: null, // armazena o id do horário sendo agendado/cancelado no momento
    error: null,
  }),

  getters: {
    horariosDisponiveis: (state) =>
      state.horarios.filter((h) => h.status === 'disponivel'),
    totalDisponiveis: (state) =>
      state.horarios.filter((h) => h.status === 'disponivel').length,
    totalMinhasConsultas: (state) => state.minhasConsultas.length,
  },

  actions: {
    async carregarHorarios(novosFiltros = {}) {
      this.loading = true
      this.error = null

      if (novosFiltros) {
        this.filtros = { ...this.filtros, ...novosFiltros }
      }

      // Limpa chaves vazias para não poluir os query params
      const params = {}
      if (this.filtros.especialista_id) params.especialista_id = this.filtros.especialista_id
      if (this.filtros.data_consulta) params.data_consulta = this.filtros.data_consulta
      if (this.filtros.status) params.status = this.filtros.status

      try {
        const data = await horarioService.getHorarios(params)
        this.horarios = Array.isArray(data) ? data : (data.results || [])
        return this.horarios
      } catch (err) {
        this.error = err.response?.data?.detail || 'Erro ao carregar horários.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async carregarMinhasConsultas() {
      this.loading = true
      this.error = null
      try {
        const data = await horarioService.getMinhasConsultas()
        this.minhasConsultas = Array.isArray(data) ? data : (data.results || [])
        return this.minhasConsultas
      } catch (err) {
        this.error = err.response?.data?.detail || 'Erro ao carregar suas consultas.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async agendar(horarioId) {
      this.loadingActionId = horarioId
      this.error = null
      try {
        const resultado = await horarioService.agendar(horarioId)
        
        // Atualiza localmente o status do horário na lista
        const index = this.horarios.findIndex(h => h.id === horarioId)
        if (index !== -1) {
          this.horarios[index] = resultado
        }

        // Se o filtro atual for apenas 'disponivel', remove da visão imediata
        if (this.filtros.status === 'disponivel') {
          this.horarios = this.horarios.filter(h => h.id !== horarioId)
        }

        return resultado
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail ||
          'Não foi possível agendar este horário.'
        this.error = errorMsg
        throw new Error(errorMsg)
      } finally {
        this.loadingActionId = null
      }
    },

    async cancelar(horarioId) {
      this.loadingActionId = horarioId
      this.error = null
      try {
        const resultado = await horarioService.cancelar(horarioId)

        // Remove de minhas consultas
        this.minhasConsultas = this.minhasConsultas.filter(c => c.id !== horarioId)

        // Atualiza na lista geral se presente
        const index = this.horarios.findIndex(h => h.id === horarioId)
        if (index !== -1) {
          this.horarios[index] = resultado
        }

        return resultado
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail ||
          'Não foi possível cancelar este agendamento.'
        this.error = errorMsg
        throw new Error(errorMsg)
      } finally {
        this.loadingActionId = null
      }
    },

    limparFiltros() {
      this.filtros = {
        especialista_id: '',
        data_consulta: '',
        status: 'disponivel',
      }
      return this.carregarHorarios()
    }
  }
})
