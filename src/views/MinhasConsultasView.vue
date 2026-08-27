<script setup>
import { ref, computed, onMounted } from 'vue'
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
  History,
  CalendarCheck2,
} from 'lucide-vue-next'

const horarioStore = useHorarioStore()
const toastStore = useToastStore()

const horarioParaCancelar = ref(null)
const modalCancelarAberto = ref(false)
const cancelando = ref(false)
const abaAtiva = ref('todas')

onMounted(() => {
  horarioStore.carregarMinhasConsultas()
})

function ehPassada(dataStr, horaInicioStr) {
  if (!dataStr || !horaInicioStr) return false
  const [ano, mes, dia] = dataStr.split('-').map(Number)
  const [hora, min] = horaInicioStr.split(':').map(Number)
  const dataHorario = new Date(ano, mes - 1, dia, hora, min, 0)
  return dataHorario <= new Date()
}

const consultasComStatus = computed(() => {
  const lista = horarioStore.minhasConsultas || []
  return lista.map((c) => ({
    ...c,
    passada: ehPassada(c.data, c.hora_inicio),
  }))
})

const consultasFuturas = computed(() =>
  consultasComStatus.value.filter((c) => !c.passada)
)

const consultasPassadas = computed(() =>
  consultasComStatus.value.filter((c) => c.passada)
)

const consultasExibidas = computed(() => {
  if (abaAtiva.value === 'futuras') return consultasFuturas.value
  if (abaAtiva.value === 'historico') return consultasPassadas.value
  return consultasComStatus.value
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
          <div class="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <CalendarClock class="w-5 h-5" />
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Minhas Consultas
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">
          Acompanhe suas consultas agendadas e histórico de atendimentos
        </p>
      </div>

      <RouterLink
        to="/"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition"
      >
        <Plus class="w-4 h-4" />
        Nova Consulta
      </RouterLink>
    </div>

    <!-- Abas de Navegação / Filtros -->
    <div v-if="consultasComStatus.length > 0" class="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
      <button
        @click="abaAtiva = 'todas'"
        type="button"
        class="px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer"
        :class="
          abaAtiva === 'todas'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        "
      >
        Todas ({{ consultasComStatus.length }})
      </button>
      <button
        @click="abaAtiva = 'futuras'"
        type="button"
        class="px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
        :class="
          abaAtiva === 'futuras'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        "
      >
        <CalendarCheck2 class="w-3.5 h-3.5" />
        Próximas ({{ consultasFuturas.length }})
      </button>
      <button
        @click="abaAtiva = 'historico'"
        type="button"
        class="px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
        :class="
          abaAtiva === 'historico'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        "
      >
        <History class="w-3.5 h-3.5" />
        Histórico ({{ consultasPassadas.length }})
      </button>
    </div>

    <!-- Carregando -->
    <div v-if="horarioStore.loading" class="py-16">
      <LoadingSpinner mensagem="Carregando seus agendamentos..." />
    </div>

    <!-- Erro -->
    <div
      v-else-if="horarioStore.error && horarioStore.minhasConsultas.length === 0"
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

    <!-- Lista de Consultas -->
    <div v-else>
      <!-- Vazio Geral -->
      <div
        v-if="consultasComStatus.length === 0"
        class="bg-white rounded-3xl border border-slate-200/80 p-12 text-center my-6 max-w-md mx-auto shadow-xs"
      >
        <div class="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mx-auto mb-4">
          <CalendarClock class="w-8 h-8" />
        </div>
        <h3 class="font-bold text-slate-800 text-lg mb-1">Nenhuma consulta agendada</h3>
        <p class="text-xs text-slate-500 mb-6 leading-relaxed">
          Você não possui agendamentos no momento. Veja os horários disponíveis e reserve sua consulta!
        </p>
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <Plus class="w-4 h-4" />
          Agendar Consulta Agora
        </RouterLink>
      </div>

      <!-- Vazio na Aba Selecionada -->
      <div
        v-else-if="consultasExibidas.length === 0"
        class="bg-white rounded-3xl border border-slate-200/80 p-10 text-center my-6 max-w-md mx-auto shadow-xs"
      >
        <p class="text-sm font-bold text-slate-700 mb-1">Nenhuma consulta nesta categoria</p>
        <p class="text-xs text-slate-500">Selecione outra aba para visualizar seus agendamentos.</p>
      </div>

      <!-- Grid de Consultas -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="consulta in consultasExibidas"
          :key="consulta.id"
          class="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition p-6 flex flex-col justify-between"
          :class="consulta.passada ? 'opacity-75 bg-slate-50/50' : ''"
        >
          <div>
            <!-- Médico, Especialidade e Status -->
            <div class="flex items-start justify-between gap-3 mb-4">
              <div class="flex items-start gap-3">
                <div
                  class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  :class="
                    consulta.passada
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-blue-100/80 text-blue-700'
                  "
                >
                  <Stethoscope class="w-6 h-6" />
                </div>
                <div>
                  <span class="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 mb-1 border border-blue-100">
                    {{ consulta.agenda?.especialista?.especialidade || 'Consulta Médica' }}
                  </span>
                  <h3 class="font-bold text-slate-900 text-base leading-snug">
                    {{ consulta.agenda?.especialista?.nome }}
                  </h3>
                </div>
              </div>

              <!-- Badge de Status -->
              <span
                v-if="consulta.passada"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700"
              >
                Realizada
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Agendada
              </span>
            </div>

            <!-- Dados da Consulta -->
            <div class="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100 text-xs mb-5">
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

          <!-- Botão Cancelar (Apenas para consultas futuras) -->
          <div v-if="!consulta.passada">
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
          <div v-else class="text-center py-2 text-xs font-medium text-slate-400">
            Atendimento concluído
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Cancelamento -->
    <ModalConfirmacao
      v-model="modalCancelarAberto"
      titulo="Cancelar Consulta Médica"
      mensagem="Tem certeza que deseja cancelar o agendamento desta consulta? A vaga será liberada para outros pacientes."
      tipo="danger"
      texto-confirmar="Sim, Confirmar Cancelamento"
      texto-cancelar="Manter Consulta"
      :carregando="cancelando"
      @confirmar="confirmarCancelamento"
    >
      <template #detalhes v-if="horarioParaCancelar">
        <div class="mt-3 p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs space-y-1.5 text-rose-950">
          <div><strong>Médico(a):</strong> {{ horarioParaCancelar.agenda?.especialista?.nome }} ({{ horarioParaCancelar.agenda?.especialista?.especialidade }})</div>
          <div><strong>Data:</strong> {{ formatarData(horarioParaCancelar.data) }}</div>
          <div><strong>Horário:</strong> {{ horarioParaCancelar.hora_inicio }} às {{ horarioParaCancelar.hora_encerramento }}</div>
        </div>
      </template>
    </ModalConfirmacao>
  </div>
</template>
