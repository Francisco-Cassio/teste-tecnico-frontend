import api from './api'

export const especialistaService = {
  async getEspecialistas(params = {}) {
    const response = await api.get('/especialistas/', { params })
    return response.data.results || response.data
  },

  async getEspecialista(id) {
    const response = await api.get(`/especialistas/${id}/`)
    return response.data
  },

  async criarEspecialista(dados) {
    const response = await api.post('/especialistas/', dados)
    return response.data
  },

  async atualizarEspecialista(id, dados) {
    const response = await api.put(`/especialistas/${id}/`, dados)
    return response.data
  },

  async excluirEspecialista(id) {
    const response = await api.delete(`/especialistas/${id}/`)
    return response.data
  }
}