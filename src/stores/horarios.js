import { defineStore } from 'pinia'
import { horarioService } from '../services/horarioService'

export const useHorarioStore = defineStore('horarios', {
  state: () => ({
    horarios: [],
    minhasConsultas: [],
    filtros: {
      busca: '',
      especialista_id: '',
      data_consulta: '',
      status: 'disponivel',
    },
    loading: false,
    loadingActionId: null,
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

      const params = {
        apenas_futuros: true,
      }
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
        
        const index = this.horarios.findIndex(h => h.id === horarioId)
        if (index !== -1) {
          this.horarios[index] = resultado
        }

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

        this.minhasConsultas = this.minhasConsultas.filter(c => c.id !== horarioId)

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
        busca: '',
        especialista_id: '',
        data_consulta: '',
        status: 'disponivel',
      }
      return this.carregarHorarios()
    }
  }
})

