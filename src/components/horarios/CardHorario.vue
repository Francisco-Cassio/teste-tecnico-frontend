<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import BadgeStatus from '../common/BadgeStatus.vue'
import { Calendar, Clock, User, Stethoscope, CheckCircle2, XCircle } from 'lucide-vue-next'

const props = defineProps({
  horario: {
    type: Object,
    required: true,
  },
  carregando: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['agendar', 'cancelar'])

const authStore = useAuthStore()

const dataFormatada = computed(() => {
  if (!props.horario.data) return ''
  const [ano, mes, dia] = props.horario.data.split('-')
  const dateObj = new Date(ano, mes - 1, dia)
  
  const opcoes = { weekday: 'short', day: '2-digit', month: 'short' }
  const dataExtenso = dateObj.toLocaleDateString('pt-BR', opcoes)
  return `${dia}/${mes}/${ano} (${dataExtenso})`
})

const especialista = computed(() => props.horario.agenda?.especialista || {})

const ehMinhaConsulta = computed(() => {
  if (!authStore.isAuthenticated || !props.horario.cliente) return false
  return props.horario.cliente.id === authStore.user?.id || props.horario.cliente.username === authStore.username
})

const podeCancelar = computed(() => {
  if (!authStore.isAuthenticated) return false
  if (props.horario.status !== 'reservado') return false
  return authStore.isInterno || ehMinhaConsulta.value
})
</script>

<template>
  <div
    class="bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between hover:shadow-md"
    :class="{
      'border-emerald-200/80 shadow-xs hover:border-emerald-300': horario.status === 'disponivel',
      'border-slate-200/80 bg-slate-50/40': horario.status === 'reservado' && !ehMinhaConsulta,
      'border-blue-200 bg-blue-50/30 shadow-xs': ehMinhaConsulta,
    }"
  >
    <!-- Topo: Especialista & Especialidade -->
    <div>
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-2.5">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
            :class="
              horario.status === 'disponivel'
                ? 'bg-emerald-100 text-emerald-700'
                : ehMinhaConsulta
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-600'
            "
          >
            <Stethoscope class="w-5 h-5" />
          </div>
          <div>
            <h4 class="font-bold text-slate-900 text-sm sm:text-base leading-snug">
              {{ especialista.nome || 'Especialista' }}
            </h4>
            <p class="text-xs font-semibold text-blue-600">
              {{ especialista.especialidade || 'Clínica Geral' }}
            </p>
          </div>
        </div>

        <BadgeStatus :status="horario.status" />
      </div>

      <!-- Informações da Data e Hora -->
      <div class="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600 my-3">
        <div class="flex items-center gap-2">
          <Calendar class="w-4 h-4 text-slate-400 shrink-0" />
          <span class="font-semibold text-slate-700">{{ dataFormatada }}</span>
        </div>
        <div class="flex items-center gap-2">
          <Clock class="w-4 h-4 text-slate-400 shrink-0" />
          <span class="font-bold text-slate-800">{{ horario.hora_inicio }} às {{ horario.hora_encerramento }}</span>
        </div>
      </div>

      <!-- Indicação de Paciente (se reservado) -->
      <div v-if="horario.cliente" class="mb-4 text-xs">
        <div
          v-if="ehMinhaConsulta"
          class="p-2 rounded-lg bg-blue-100/70 text-blue-900 font-semibold flex items-center gap-1.5"
        >
          <User class="w-3.5 h-3.5 text-blue-700" />
          Sua consulta agendada
        </div>
        <div
          v-else-if="authStore.isInterno"
          class="p-2 rounded-lg bg-slate-100 text-slate-700 font-medium flex items-center gap-1.5"
        >
          <User class="w-3.5 h-3.5 text-slate-500" />
          Paciente: <span class="font-bold">{{ horario.cliente.username }}</span>
        </div>
      </div>
    </div>

    <!-- Ações / Botões -->
    <div class="pt-2">
      <!-- Botão Agendar (Disponível) -->
      <button
        v-if="horario.status === 'disponivel'"
        @click="emit('agendar', horario)"
        :disabled="carregando"
        type="button"
        class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        <span
          v-if="carregando"
          class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
        ></span>
        <CheckCircle2 v-else class="w-4 h-4" />
        Agendar Consulta
      </button>

      <!-- Botão Cancelar (Se permitido) -->
      <button
        v-else-if="podeCancelar"
        @click="emit('cancelar', horario)"
        :disabled="carregando"
        type="button"
        class="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        <span
          v-if="carregando"
          class="w-3.5 h-3.5 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin"
        ></span>
        <XCircle v-else class="w-4 h-4 text-rose-600" />
        Cancelar Agendamento
      </button>

      <!-- Indisponível para outros -->
      <div
        v-else
        class="text-center py-2 text-xs font-semibold text-slate-400 bg-slate-100/60 rounded-xl"
      >
        Horário Reservado
      </div>
    </div>
  </div>
</template>
