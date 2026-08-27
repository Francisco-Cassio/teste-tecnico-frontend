import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [],
  }),

  actions: {
    show(message, type = 'success', duration = 4000) {
      const id = Date.now() + Math.random().toString(36).substring(2, 9)
      const toast = { id, message, type }
      this.toasts.push(toast)

      if (duration > 0) {
        setTimeout(() => {
          this.remove(id)
        }, duration)
      }

      return id
    },

    success(message, duration = 4000) {
      return this.show(message, 'success', duration)
    },

    error(message, duration = 5000) {
      return this.show(message, 'error', duration)
    },

    info(message, duration = 4000) {
      return this.show(message, 'info', duration)
    },

    remove(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
  },
})
