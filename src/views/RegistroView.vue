<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { UserPlus, User, Mail, Lock, Stethoscope, AlertCircle, ArrowLeft } from 'lucide-vue-next'

const authStore = useAuthStore()
const toastStore = useToastStore()
const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const carregando = ref(false)
const erroLocal = ref('')

async function handleRegister() {
  if (!username.value || !password.value) {
    erroLocal.value = 'Por favor, preencha o usuário e a senha.'
    return
  }

  if (password.value.length < 6) {
    erroLocal.value = 'A senha deve conter no mínimo 6 caracteres.'
    return
  }

  if (password.value !== confirmPassword.value) {
    erroLocal.value = 'As senhas digitadas não conferem.'
    return
  }

  erroLocal.value = ''
  carregando.value = true

  try {
    await authStore.registro({
      username: username.value,
      email: email.value,
      password: password.value,
    })

    toastStore.success('Cadastro realizado com sucesso! Fazendo login...')

    await authStore.login(username.value, password.value)
    router.push('/')
  } catch (err) {
    erroLocal.value = err.message || 'Erro ao realizar cadastro.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
        <!-- Voltar -->
        <RouterLink
          to="/login"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ArrowLeft class="w-4 h-4" />
          Voltar para login
        </RouterLink>

        <!-- Título -->
        <div class="text-center mb-8">
          <div
            class="w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/30 mb-4"
          >
            <UserPlus class="w-8 h-8" />
          </div>
          <h2 class="text-2xl font-bold text-slate-900">Cadastro de Paciente</h2>
          <p class="text-sm text-slate-500 mt-1">
            Crie sua conta para consultar e agendar horários
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
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Usuário (Username) *
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
                placeholder="Ex: joao_silva"
                class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              E-mail
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail class="w-5 h-5" />
              </div>
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="seu.email@exemplo.com"
                class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Senha (mínimo 6 caracteres) *
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock class="w-5 h-5" />
              </div>
              <input
                v-model="password"
                type="password"
                required
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Confirmar Senha *
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock class="w-5 h-5" />
              </div>
              <input
                v-model="confirmPassword"
                type="password"
                required
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="carregando"
            class="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
          >
            <span
              v-if="carregando"
              class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></span>
            <UserPlus v-else class="w-4 h-4" />
            {{ carregando ? 'Cadastrando...' : 'Finalizar Cadastro' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-slate-600">
          Já possui cadastro?
          <RouterLink
            to="/login"
            class="font-bold text-blue-600 hover:text-blue-700 hover:underline ml-1"
          >
            Fazer login
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

