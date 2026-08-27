<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useHorarioStore } from '../stores/horarios'
import { useToastStore } from '../stores/toast'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ModalConfirmacao from '../components/common/ModalConfirmacao.vue'
import {
  CalendarClock,
  Calendar,
  Clock,
  Stethoscope,
  XCircle,
  Plus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-vue-next'

const horarioStore = useHorarioStore()
const toastStore = useToastStore()

const horarioParaCancelar = ref(null)
const modalCancelarAberto = ref(false)
const cancelando = ref(false)

onMounted(() => {
  horarioStore.carregarMinhasConsultas()
})

function iniciarCancelamento(horario) {
  horarioParaCancelar.value = horario
  modalCancelarAberto.value = true
}

async function confirmarCancelamento() {
  if (!horarioParaCancelar.value) return
  cancelando.value = true
  try {
    await horarioStore.cancelar(horarioParaCancelar.value.id)
    toastStore.success('Consulta cancelada com sucesso. A vaga foi liberada.')
    modalCancelarAberto.value = false
    horarioParaCancelar.value = null
  } catch (err) {
    toastStore.error(err.message)
  } finally {
    cancelando.value = false
  }
}

function formatarData(dataStr) {
  if (!dataStr) return ''
  const [ano, mes, dia] = dataStr.split('-')
  const dateObj = new Date(ano, mes - 1, dia)
  return `${dia}/${mes}/${ano} (${dateObj.toLocaleDateString('pt-BR', { weekday: 'long' })})`
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2.5 mb-1">
          <div class="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <CalendarClock class="w-5 h-5" />
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Minhas Consultas
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">
          Acompanhe suas consultas marcadas e gerencie seus agendamentos
        </p>
      </div>

      <RouterLink
        to="/"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition"
      >
        <Plus class="w-4 h-4" />
        Nova Consulta
      </RouterLink>
    </div>

    <!-- Carregando -->
    <div v-if="horarioStore.loading" class="py-16">
      <LoadingSpinner mensagem="Carregando seus agendamentos..." />
    </div>

    <!-- Erro -->
    <div
      v-else-if="horarioStore.error"
      class="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center my-8 max-w-lg mx-auto"
    >
      <AlertCircle class="w-8 h-8 text-rose-600 mx-auto mb-2" />
      <h3 class="font-bold text-rose-900 mb-1">Erro ao buscar suas consultas</h3>
      <p class="text-sm text-rose-700 mb-4">{{ horarioStore.error }}</p>
      <button
        @click="horarioStore.carregarMinhasConsultas()"
        type="button"
        class="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition cursor-pointer"
      >
        Recarregar
      </button>
    </div>

    <!-- Lista -->
    <div v-else>
      <!-- Vazio -->
      <div
        v-if="horarioStore.minhasConsultas.length === 0"
        class="bg-white rounded-3xl border border-slate-200/80 p-12 text-center my-6 max-w-md mx-auto shadow-xs"
      >
        <div class="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mx-auto mb-4">
          <CalendarClock class="w-8 h-8" />
        </div>
        <h3 class="font-bold text-slate-800 text-lg mb-1">Nenhuma consulta agendada</h3>
        <p class="text-xs text-slate-500 mb-6 leading-relaxed">
          Você não possui agendamentos futuros no momento. Veja os horários disponíveis e reserve sua consulta!
        </p>
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <Plus class="w-4 h-4" />
          Agendar Consulta Agora
        </RouterLink>
      </div>

      <!-- Grid de Consultas -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="consulta in horarioStore.minhasConsultas"
          :key="consulta.id"
          class="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition p-6 flex flex-col justify-between"
        >
          <div>
            <!-- Médico e Especialidade -->
            <div class="flex items-start gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                <Stethoscope class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 mb-1 border border-blue-100">
                  {{ consulta.agenda?.especialista?.especialidade || 'Consulta Médica' }}
                </span>
                <h3 class="font-bold text-slate-900 text-base leading-snug">
                  {{ consulta.agenda?.especialista?.nome }}
                </h3>
              </div>
            </div>

            <!-- Dados da Consulta -->
            <div class="bg-slate-50 rounded-xl p-3.5 space-y-2 border border-slate-100 text-xs mb-5">
              <div class="flex items-center gap-2 text-slate-700">
                <Calendar class="w-4 h-4 text-blue-600 shrink-0" />
                <span class="font-semibold capitalize">{{ formatarData(consulta.data) }}</span>
              </div>
              <div class="flex items-center gap-2 text-slate-700">
                <Clock class="w-4 h-4 text-blue-600 shrink-0" />
                <span class="font-bold text-slate-900">
                  {{ consulta.hora_inicio }} às {{ consulta.hora_encerramento }}
                </span>
              </div>
            </div>
          </div>

          <!-- Botão Cancelar -->
          <button
            @click="iniciarCancelamento(consulta)"
            :disabled="cancelando"
            type="button"
            class="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <XCircle class="w-4 h-4 text-rose-600" />
            Cancelar Consulta
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Cancelamento -->
    <ModalConfirmacao
      v-model="modalCancelarAberto"
      titulo="Cancelar Consulta Médica"
      mensagem="Tem certeza que deseja cancelar o agendamento desta consulta?"
      tipo="danger"
      texto-confirmar="Sim, Confirmar Cancelamento"
      texto-cancelar="Não, Manter"
      :carregando="cancelando"
      @confirmar="confirmarCancelamento"
    >
      <template #detalhes v-if="horarioParaCancelar">
        <div class="mt-3 p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs space-y-1.5 text-rose-950">
          <div><strong>Médico(a):</strong> {{ horarioParaCancelar.agenda?.especialista?.nome }}</div>
          <div><strong>Data:</strong> {{ horarioParaCancelar.data }}</div>
          <div><strong>Horário:</strong> {{ horarioParaCancelar.hora_inicio }} às {{ horarioParaCancelar.hora_encerramento }}</div>
        </div>
      </template>
    </ModalConfirmacao>
  </div>
</template>
