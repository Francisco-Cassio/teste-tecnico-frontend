import api from './api'

export const horarioService = {
  async getHorarios(filtros = {}) {
    const response = await api.get('/horarios/', { params: { page_size: 200, ...filtros } })
    return response.data.results || response.data
  },

  async getMinhasConsultas() {
    const response = await api.get('/horarios/minhas_consultas/', { params: { page_size: 200 } })
    return response.data.results || response.data
  },

  async agendar(horarioId) {
    const response = await api.post(`/horarios/${horarioId}/agendar/`)
    return response.data
  },

  async cancelar(horarioId) {
    const response = await api.post(`/horarios/${horarioId}/cancelar/`)
    return response.data
  }
}