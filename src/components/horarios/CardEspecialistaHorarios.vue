<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import {
  Stethoscope,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-vue-next'

const props = defineProps({
  grupo: {
    type: Object,
    required: true,
  },
  loadingActionId: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['agendar', 'cancelar'])

const authStore = useAuthStore()

const expandido = ref(false)

const especialista = computed(() => props.grupo.especialista || {})
const diasAgrupados = computed(() => props.grupo.dias || [])

function formatarDataCabecalho(dataStr) {
  if (!dataStr) return ''
  const [ano, mes, dia] = dataStr.split('-')
  const dateObj = new Date(Number(ano), Number(mes) - 1, Number(dia))
  
  const diaSemana = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' })
  const diaSemanaCap = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)
  
  return `${diaSemanaCap}, ${dia}/${mes}/${ano}`
}

function ehMinhaConsulta(horario) {
  if (!authStore.isAuthenticated || !horario.cliente) return false
  return horario.cliente.id === authStore.user?.id || horario.cliente.username === authStore.username
}

function handleClickHorario(horario) {
  if (horario.status === 'disponivel') {
    emit('agendar', horario)
  } else if (horario.status === 'reservado' && (authStore.isInterno || ehMinhaConsulta(horario))) {
    emit('cancelar', horario)
  }
}
</script>

<template>
  <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
    <!-- Cabeçalho do Especialista (Sempre Visível) -->
    <div class="p-5 sm:p-6 bg-gradient-to-r from-slate-50/90 to-white">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Informações do Médico -->
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-blue-500/20 shrink-0">
            <Stethoscope class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-bold text-slate-900 text-base sm:text-lg leading-tight">
                {{ especialista.nome || 'Especialista' }}
              </h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                {{ especialista.especialidade || 'Clínica Geral' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              {{ especialista.email }}
            </p>
          </div>
        </div>

        <!-- Badge de Vagas e Botão Expansor -->
        <div class="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <span
            v-if="grupo.totalDisponiveis > 0"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {{ grupo.totalDisponiveis }} vaga(s) livre(s)
          </span>
          <span
            v-else
            class="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200"
          >
            Sem vagas livres
          </span>
        </div>
      </div>

      <!-- Botão Expansor / Acordeão -->
      <div class="mt-4 pt-3 border-t border-slate-100">
        <button
          @click="expandido = !expandido"
          type="button"
          class="w-full py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border shadow-2xs"
          :class="
            expandido
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-blue-700'
          "
        >
          <span class="flex items-center gap-2">
            <Calendar class="w-4 h-4 text-blue-600" />
            <span>{{ expandido ? 'Ocultar horários' : `Ver horários de atendimento (${diasAgrupados.length} dias disponíveis)` }}</span>
          </span>
          <ChevronUp v-if="expandido" class="w-4 h-4 text-blue-600" />
          <ChevronDown v-else class="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>

    <!-- Bloco de Horários (Expandido via Acordeão) -->
    <div v-if="expandido" class="p-5 sm:p-6 bg-slate-50/50 border-t border-slate-100 space-y-4">
      <div
        v-for="dia in diasAgrupados"
        :key="dia.data"
        class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs"
      >
        <!-- Data Formatada em Padrão Brasileiro DD/MM/YYYY -->
        <div class="flex items-center gap-2 mb-3 text-xs font-bold text-slate-800">
          <Calendar class="w-4 h-4 text-blue-600" />
          <span>{{ formatarDataCabecalho(dia.data) }}</span>
        </div>

        <!-- Grade de Pílulas de Horário -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <button
            v-for="horario in dia.horarios"
            :key="horario.id"
            type="button"
            :disabled="loadingActionId === horario.id || (horario.status === 'reservado' && !ehMinhaConsulta(horario) && !authStore.isInterno)"
            @click.stop="handleClickHorario(horario)"
            class="group relative py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-2xs"
            :class="{
              // Disponível
              'bg-emerald-50/60 hover:bg-emerald-600 text-emerald-800 hover:text-white border-emerald-200 hover:border-emerald-600 hover:shadow-xs cursor-pointer active:scale-95':
                horario.status === 'disponivel',
              
              // Minha Consulta
              'bg-blue-600 text-white border-blue-600 hover:bg-rose-600 hover:border-rose-600 cursor-pointer active:scale-95':
                ehMinhaConsulta(horario),

              // Reservado por outro
              'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed':
                horario.status === 'reservado' && !ehMinhaConsulta(horario),
            }"
            :title="
              horario.status === 'disponivel'
                ? 'Toque para agendar este horário'
                : ehMinhaConsulta(horario)
                ? 'Sua consulta (Toque para cancelar)'
                : 'Horário já reservado'
            "
          >
            <!-- Spinner se estiver em carregamento -->
            <span
              v-if="loadingActionId === horario.id"
              class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
            ></span>

            <!-- Horário -->
            <template v-else>
              <Clock class="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span>{{ horario.hora_inicio }}</span>
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
