<script setup>
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { LogIn, Lock, User, Stethoscope, Shield, Sparkles, AlertCircle } from 'lucide-vue-next'

const authStore = useAuthStore()
const toastStore = useToastStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const carregando = ref(false)
const erroLocal = ref('')

async function handleSubmit() {
  if (!username.value || !password.value) {
    erroLocal.value = 'Preencha o usuário e a senha.'
    return
  }

  erroLocal.value = ''
  carregando.value = true

  try {
    await authStore.login(username.value, password.value)
    toastStore.success(`Bem-vindo(a), ${authStore.username}!`)

    const redirectPath = route.query.redirect || (authStore.isInterno ? '/admin/especialistas' : '/')
    router.push(redirectPath)
  } catch (err) {
    erroLocal.value = err.message || 'Usuário ou senha inválidos.'
  } finally {
    carregando.value = false
  }
}

function preencherCredencial(user, pass) {
  username.value = user
  password.value = pass
  erroLocal.value = ''
}
</script>

<template>
  <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
    <div class="max-w-md w-full">
      <!-- Card Principal -->
      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
        <!-- Ícone / Título -->
        <div class="text-center mb-8">
          <div
            class="w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/30 mb-4"
          >
            <Stethoscope class="w-8 h-8" />
          </div>
          <h2 class="text-2xl font-bold text-slate-900">Acesse sua Conta</h2>
          <p class="text-sm text-slate-500 mt-1">
            Entre para gerenciar ou agendar suas consultas médicas
          </p>
        </div>

        <!-- Alerta de Erro -->
        <div
          v-if="erroLocal"
          class="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm font-medium"
        >
          <AlertCircle class="w-5 h-5 text-rose-600 shrink-0" />
          <span>{{ erroLocal }}</span>
        </div>

        <!-- Formulário -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Usuário
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User class="w-5 h-5" />
              </div>
              <input
                v-model="username"
                type="text"
                required
                autocomplete="username"
                placeholder="Seu nome de usuário"
                class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Senha
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock class="w-5 h-5" />
              </div>
              <input
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
                placeholder="Sua senha de acesso"
                class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="carregando"
            class="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
          >
            <span
              v-if="carregando"
              class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></span>
            <LogIn v-else class="w-4 h-4" />
            {{ carregando ? 'Entrando...' : 'Entrar no Sistema' }}
          </button>
        </form>

        <!-- Link de Cadastro -->
        <div class="mt-6 text-center text-sm text-slate-600">
          Não tem uma conta de paciente?
          <RouterLink
            to="/registro"
            class="font-bold text-blue-600 hover:text-blue-700 hover:underline ml-1"
          >
            Cadastre-se grátis
          </RouterLink>
        </div>

        <!-- Divisor para Credenciais Rápidas -->
        <div class="relative my-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-200"></div>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-white px-3 text-slate-400 font-bold tracking-wider flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-amber-500" />
              Contas de Teste Rápidas
            </span>
          </div>
        </div>

        <!-- Botões de Preenchimento Rápido -->
        <div class="grid grid-cols-3 gap-2">
          <button
            @click="preencherCredencial('paciente_joao', 'senha123')"
            type="button"
            class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-200 text-left transition group cursor-pointer"
          >
            <div class="text-[11px] font-bold text-slate-700 group-hover:text-blue-700">Paciente</div>
            <div class="text-[10px] text-slate-500">paciente_joao</div>
          </button>

          <button
            @click="preencherCredencial('recepcao', 'senha123')"
            type="button"
            class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50 hover:border-indigo-200 text-left transition group cursor-pointer"
          >
            <div class="text-[11px] font-bold text-slate-700 group-hover:text-indigo-700">Recepção</div>
            <div class="text-[10px] text-slate-500">recepcao</div>
          </button>

          <button
            @click="preencherCredencial('admin', 'admin123')"
            type="button"
            class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-purple-50 hover:border-purple-200 text-left transition group cursor-pointer"
          >
            <div class="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">Admin</div>
            <div class="text-[10px] text-slate-500">admin</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
