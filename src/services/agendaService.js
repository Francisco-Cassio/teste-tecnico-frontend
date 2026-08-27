import api from './api'

export const agendaService = {
  async getAgendas(params = {}) {
    const response = await api.get('/agendas/', { params })
    return response.data.results || response.data
  },

  async getAgenda(id) {
    const response = await api.get(`/agendas/${id}/`)
    return response.data
  },

  async criarAgenda(dados) {
    const response = await api.post('/agendas/', dados)
    return response.data
  },

  async excluirAgenda(id) {
    const response = await api.delete(`/agendas/${id}/`)
    return response.data
  }
}