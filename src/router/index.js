import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegistroView from '../views/RegistroView.vue'
import MinhasConsultasView from '../views/MinhasConsultasView.vue'
import EspecialistasView from '../views/admin/EspecialistasView.vue'
import AgendasView from '../views/admin/AgendasView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Agendamento de Consultas — Clínica Médica',
    },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Acessar Conta — Clínica Médica',
      guestOnly: true,
    },
  },
  {
    path: '/registro',
    name: 'registro',
    component: RegistroView,
    meta: {
      title: 'Criar Conta de Paciente — Clínica Médica',
      guestOnly: true,
    },
  },
  {
    path: '/minhas-consultas',
    name: 'minhas-consultas',
    component: MinhasConsultasView,
    meta: {
      title: 'Minhas Consultas — Clínica Médica',
      requiresAuth: true,
    },
  },
  {
    path: '/admin/especialistas',
    name: 'admin-especialistas',
    component: EspecialistasView,
    meta: {
      title: 'Gestão de Especialistas — Painel Interno',
      requiresAuth: true,
      requiresInterno: true,
    },
  },
  {
    path: '/admin/agendas',
    name: 'admin-agendas',
    component: AgendasView,
    meta: {
      title: 'Gestão de Agendas — Painel Interno',
      requiresAuth: true,
      requiresInterno: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Atualiza o título da página
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 1. Rota requer autenticação e o usuário não está logado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath !== '/' ? to.fullPath : undefined },
    })
  }

  // 2. Rota requer perfil interno (atendente / admin)
  if (to.meta.requiresInterno && !authStore.isInterno) {
    return next({ name: 'home' })
  }

  // 3. Rota exclusiva para convidados (login/registro) e o usuário já está logado
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'home' })
  }

  next()
})

export default router
