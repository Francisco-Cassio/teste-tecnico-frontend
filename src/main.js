import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Restaura / valida sessão do usuário se houver token no localStorage
const authStore = useAuthStore()
if (authStore.accessToken) {
  authStore.fetchCurrentUser().catch(() => {})
}

app.mount('#app')
