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
      title: 'Agendamento de Consultas — LunaMed',
    },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Acessar Conta — LunaMed',
      guestOnly: true,
    },
  },
  {
    path: '/registro',
    name: 'registro',
    component: RegistroView,
    meta: {
      title: 'Criar Conta de Paciente — LunaMed',
      guestOnly: true,
    },
  },
  {
    path: '/minhas-consultas',
    name: 'minhas-consultas',
    component: MinhasConsultasView,
    meta: {
      title: 'Minhas Consultas — LunaMed',
      requiresAuth: true,
    },
  },
  {
    path: '/admin/especialistas',
    name: 'admin-especialistas',
    component: EspecialistasView,
    meta: {
      title: 'Gestão de Especialistas — LunaMed',
      requiresAuth: true,
      requiresInterno: true,
    },
  },
  {
    path: '/admin/agendas',
    name: 'admin-agendas',
    component: AgendasView,
    meta: {
      title: 'Gestão de Agendas — LunaMed',
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

  if (to.meta.title) {
    document.title = to.meta.title
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath !== '/' ? to.fullPath : undefined },
    })
  }

  if (to.meta.requiresInterno && !authStore.isInterno) {
    return next({ name: 'home' })
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'home' })
  }

  next()
})

export default router

