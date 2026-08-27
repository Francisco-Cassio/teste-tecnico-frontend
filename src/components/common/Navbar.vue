<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'
import {
  Stethoscope,
  Calendar,
  User,
  Users,
  CalendarClock,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const toastStore = useToastStore()
const router = useRouter()

const menuAberto = ref(false)

function toggleMenu() {
  menuAberto.value = !menuAberto.value
}

function fecharMenu() {
  menuAberto.value = false
}

function handleLogout() {
  authStore.logout()
  toastStore.info('Sessão encerrada com sucesso.')
  fecharMenu()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo & Marca -->
        <RouterLink
          to="/"
          @click="fecharMenu"
          class="flex items-center gap-2.5 group transition"
        >
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition"
          >
            <Stethoscope class="w-6 h-6" />
          </div>
          <div>
            <span class="text-lg font-bold bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">
              ClínicaMed
            </span>
            <span class="hidden sm:block text-[11px] font-medium text-slate-500 -mt-1 tracking-wide">
              Agendamento de Consultas
            </span>
          </div>
        </RouterLink>

        <!-- Navegação Desktop -->
        <nav class="hidden md:flex items-center gap-1">
          <RouterLink
            to="/"
            class="px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2"
            :class="
              $route.path === '/'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            "
          >
            <Calendar class="w-4 h-4" />
            Horários
          </RouterLink>

          <!-- Links do Paciente -->
          <RouterLink
            v-if="authStore.isAuthenticated"
            to="/minhas-consultas"
            class="px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2"
            :class="
              $route.path === '/minhas-consultas'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            "
          >
            <CalendarClock class="w-4 h-4" />
            Minhas Consultas
          </RouterLink>

          <!-- Links Administrativos (Interno) -->
          <template v-if="authStore.isInterno">
            <div class="h-5 w-px bg-slate-200 mx-1"></div>

            <RouterLink
              to="/admin/especialistas"
              class="px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2"
              :class="
                $route.path === '/admin/especialistas'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              "
            >
              <Users class="w-4 h-4" />
              Especialistas
            </RouterLink>

            <RouterLink
              to="/admin/agendas"
              class="px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2"
              :class="
                $route.path === '/admin/agendas'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              "
            >
              <CalendarClock class="w-4 h-4" />
              Agendas
            </RouterLink>
          </template>
        </nav>

        <!-- Ações / Usuário Desktop -->
        <div class="hidden md:flex items-center gap-3">
          <!-- Deslogado -->
          <template v-if="!authStore.isAuthenticated">
            <RouterLink
              to="/login"
              class="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5"
            >
              <LogIn class="w-4 h-4" />
              Entrar
            </RouterLink>
            <RouterLink
              to="/registro"
              class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow-md transition flex items-center gap-1.5"
            >
              <UserPlus class="w-4 h-4" />
              Criar Conta
            </RouterLink>
          </template>

          <!-- Logado -->
          <template v-else>
            <div class="flex items-center gap-2.5 bg-slate-100/80 px-3.5 py-1.5 rounded-xl border border-slate-200/60">
              <div
                class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                :class="
                  authStore.isInterno
                    ? 'bg-indigo-600 text-white'
                    : 'bg-blue-600 text-white'
                "
              >
                {{ authStore.username?.charAt(0).toUpperCase() }}
              </div>
              <div class="text-left">
                <div class="text-xs font-bold text-slate-800 leading-tight">
                  {{ authStore.username }}
                </div>
                <div class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {{ authStore.isInterno ? 'Equipe Interna' : 'Paciente' }}
                </div>
              </div>
            </div>

            <button
              @click="handleLogout"
              type="button"
              title="Sair da Conta"
              class="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              <LogOut class="w-5 h-5" />
            </button>
          </template>
        </div>

        <!-- Botão Menu Mobile -->
        <div class="md:hidden flex items-center">
          <button
            @click="toggleMenu"
            type="button"
            class="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
          >
            <Menu v-if="!menuAberto" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Menu Mobile Dropdown -->
    <div
      v-if="menuAberto"
      class="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2"
    >
      <RouterLink
        to="/"
        @click="fecharMenu"
        class="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
      >
        Horários Disponíveis
      </RouterLink>

      <RouterLink
        v-if="authStore.isAuthenticated"
        to="/minhas-consultas"
        @click="fecharMenu"
        class="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
      >
        Minhas Consultas
      </RouterLink>

      <template v-if="authStore.isInterno">
        <div class="border-t border-slate-100 my-2 pt-2">
          <div class="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Administração
          </div>
          <RouterLink
            to="/admin/especialistas"
            @click="fecharMenu"
            class="block px-3 py-2 rounded-xl text-base font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
          >
            Gestão de Especialistas
          </RouterLink>
          <RouterLink
            to="/admin/agendas"
            @click="fecharMenu"
            class="block px-3 py-2 rounded-xl text-base font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
          >
            Gestão de Agendas
          </RouterLink>
        </div>
      </template>

      <!-- Autenticação Mobile -->
      <div class="border-t border-slate-100 pt-3 mt-3">
        <template v-if="!authStore.isAuthenticated">
          <div class="grid grid-cols-2 gap-2">
            <RouterLink
              to="/login"
              @click="fecharMenu"
              class="flex items-center justify-center gap-1.5 py-2.5 text-center font-semibold text-sm text-slate-700 bg-slate-100 rounded-xl"
            >
              <LogIn class="w-4 h-4" />
              Entrar
            </RouterLink>
            <RouterLink
              to="/registro"
              @click="fecharMenu"
              class="flex items-center justify-center gap-1.5 py-2.5 text-center font-semibold text-sm text-white bg-blue-600 rounded-xl shadow-xs"
            >
              <UserPlus class="w-4 h-4" />
              Cadastro
            </RouterLink>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
            <div>
              <div class="text-sm font-bold text-slate-800">{{ authStore.username }}</div>
              <div class="text-xs text-slate-500 capitalize">{{ authStore.tipoAcesso }}</div>
            </div>
            <button
              @click="handleLogout"
              type="button"
              class="text-sm font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <LogOut class="w-4 h-4" />
              Sair
            </button>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>
