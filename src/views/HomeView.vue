<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useHorarioStore } from '../stores/horarios'
import { useToastStore } from '../stores/toast'
import FiltrosHorarios from '../components/horarios/FiltrosHorarios.vue'
import CardEspecialistaHorarios from '../components/horarios/CardEspecialistaHorarios.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ModalConfirmacao from '../components/common/ModalConfirmacao.vue'
import { CalendarCheck, Clock, AlertCircle } from 'lucide-vue-next'

const authStore = useAuthStore()
const horarioStore = useHorarioStore()
const toastStore = useToastStore()
const router = useRouter()

const horarioParaAgendar = ref(null)
const horarioParaCancelar = ref(null)
const modalAgendarAberto = ref(false)
const modalCancelarAberto = ref(false)
const acaoCarregando = ref(false)

onMounted(() => {
  horarioStore.carregarHorarios()
})

function ehHorarioPassado(dataStr, horaInicioStr) {
  if (!dataStr || !horaInicioStr) return false
  const [ano, mes, dia] = dataStr.split('-').map(Number)
  const [hora, min] = horaInicioStr.split(':').map(Number)
  const dataHorario = new Date(ano, mes - 1, dia, hora, min, 0)
  return dataHorario <= new Date()
}

const especialistasAgrupados = computed(() => {
  const lista = horarioStore.horarios || []
  const gruposMap = new Map()

  for (const horario of lista) {
    const esp = horario.agenda?.especialista
    if (!esp) continue

    if (ehHorarioPassado(horario.data, horario.hora_inicio)) {
      continue
    }

    if (!gruposMap.has(esp.id)) {
      gruposMap.set(esp.id, {
        especialista: esp,
        totalDisponiveis: 0,
        diasMap: new Map(),
      })
    }

    const grupo = gruposMap.get(esp.id)
    if (horario.status === 'disponivel') {
      grupo.totalDisponiveis++
    }

    if (!grupo.diasMap.has(horario.data)) {
      grupo.diasMap.set(horario.data, {
        data: horario.data,
        horarios: [],
      })
    }

    grupo.diasMap.get(horario.data).horarios.push(horario)
  }

  const resultado = []
  for (const grupo of gruposMap.values()) {
    const dias = Array.from(grupo.diasMap.values()).sort((a, b) => a.data.localeCompare(b.data))
    for (const d of dias) {
      d.horarios.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
    }
    if (dias.length > 0) {
      const termoBusca = (horarioStore.filtros.busca || '').trim().toLowerCase()
      const matchNome = (grupo.especialista.nome || '').toLowerCase().includes(termoBusca)
      const matchEsp = (grupo.especialista.especialidade || '').toLowerCase().includes(termoBusca)

      if (!termoBusca || matchNome || matchEsp) {
        resultado.push({
          especialista: grupo.especialista,
          totalDisponiveis: grupo.totalDisponiveis,
          dias,
        })
      }
    }
  }

  return resultado.sort((a, b) => a.especialista.nome.localeCompare(b.especialista.nome))
})

function iniciarAgendamento(horario) {
  if (!authStore.isAuthenticated) {
    toastStore.info('Faça login para reservar uma consulta.')
    router.push({ name: 'login', query: { redirect: '/' } })
    return
  }
  horarioParaAgendar.value = horario
  modalAgendarAberto.value = true
}

async function confirmarAgendamento() {
  if (!horarioParaAgendar.value) return
  acaoCarregando.value = true
  try {
    await horarioStore.agendar(horarioParaAgendar.value.id)
    toastStore.success('Consulta agendada com sucesso!')
    modalAgendarAberto.value = false
    horarioParaAgendar.value = null
  } catch (err) {
    toastStore.error(err.message)
  } finally {
    acaoCarregando.value = false
  }
}

function iniciarCancelamento(horario) {
  horarioParaCancelar.value = horario
  modalCancelarAberto.value = true
}

async function confirmarCancelamento() {
  if (!horarioParaCancelar.value) return
  acaoCarregando.value = true
  try {
    await horarioStore.cancelar(horarioParaCancelar.value.id)
    toastStore.success('Agendamento cancelado com sucesso!')
    modalCancelarAberto.value = false
    horarioParaCancelar.value = null
  } catch (err) {
    toastStore.error(err.message)
  } finally {
    acaoCarregando.value = false
  }
}

function formatarDataBR(dataStr) {
  if (!dataStr) return ''
  const [ano, mes, dia] = dataStr.split('-')
  return `${dia}/${mes}/${ano}`
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
    <!-- Hero Banner -->
    <div
      class="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-blue-600/15 mb-8 relative overflow-hidden"
    >
      <div class="relative z-10 max-w-2xl">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-4 text-cyan-100 border border-white/10">
          <CalendarCheck class="w-4 h-4" />
          Agendamentos Rápidos e Seguros
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
          Agende sua Consulta Médica Online
        </h1>
        <p class="text-blue-100 text-sm sm:text-base leading-relaxed">
          Consulte os horários por especialista, toque no horário de sua preferência e confirme sua reserva instantaneamente.
        </p>
      </div>

      <!-- Detalhe decorativo no fundo -->
      <div class="absolute -right-12 -bottom-12 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>

    <!-- Filtros Dinâmicos -->
    <FiltrosHorarios />

    <!-- Estado de Carregamento -->
    <div v-if="horarioStore.loading" class="py-16">
      <LoadingSpinner mensagem="Buscando horários disponíveis..." />
    </div>

    <!-- Estado de Erro -->
    <div
      v-else-if="horarioStore.error && horarioStore.horarios.length === 0"
      class="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center my-8 max-w-lg mx-auto"
    >
      <AlertCircle class="w-8 h-8 text-rose-600 mx-auto mb-2" />
      <h3 class="font-bold text-rose-900 mb-1">Não foi possível carregar os horários</h3>
      <p class="text-sm text-rose-700 mb-4">{{ horarioStore.error }}</p>
      <button
        @click="horarioStore.carregarHorarios()"
        type="button"
        class="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition cursor-pointer"
      >
        Tentar novamente
      </button>
    </div>

    <!-- Lista de Médicos com Horários Agrupados -->
    <div v-else>
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold text-slate-800">
          Especialistas com Atendimento ({{ especialistasAgrupados.length }})
        </h2>
        <span class="text-xs font-semibold text-slate-500">
          {{ horarioStore.totalDisponiveis }} vaga(s) disponível(is) no total
        </span>
      </div>

      <!-- Lista Vazia -->
      <div
        v-if="especialistasAgrupados.length === 0"
        class="bg-white rounded-3xl border border-slate-200/80 p-12 text-center my-4 max-w-md mx-auto shadow-xs"
      >
        <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <Clock class="w-7 h-7" />
        </div>
        <h3 class="font-bold text-slate-800 text-base mb-1">Nenhum horário encontrado</h3>
        <p class="text-xs text-slate-500 mb-4 leading-relaxed">
          Tente alterar ou limpar os filtros para visualizar outros especialistas e datas.
        </p>
        <button
          @click="horarioStore.limparFiltros()"
          type="button"
          class="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          Limpar todos os filtros
        </button>
      </div>

      <!-- Lista de Cards por Médico -->
      <div v-else class="space-y-6">
        <CardEspecialistaHorarios
          v-for="grupo in especialistasAgrupados"
          :key="grupo.especialista.id"
          :grupo="grupo"
          :loading-action-id="horarioStore.loadingActionId"
          @agendar="iniciarAgendamento"
          @cancelar="iniciarCancelamento"
        />
      </div>
    </div>

    <!-- Modal de Confirmação de Agendamento -->
    <ModalConfirmacao
      v-model="modalAgendarAberto"
      titulo="Confirmar Agendamento"
      mensagem="Deseja confirmar a reserva da consulta com os seguintes dados?"
      tipo="success"
      texto-confirmar="Sim, Agendar Consulta"
      texto-cancelar="Voltar"
      :carregando="acaoCarregando"
      @confirmar="confirmarAgendamento"
    >
      <template #detalhes v-if="horarioParaAgendar">
        <div class="mt-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs space-y-1.5 text-emerald-950">
          <div><strong>Médico(a):</strong> {{ horarioParaAgendar.agenda?.especialista?.nome }} ({{ horarioParaAgendar.agenda?.especialista?.especialidade }})</div>
          <div><strong>Data:</strong> {{ formatarDataBR(horarioParaAgendar.data) }}</div>
          <div><strong>Horário:</strong> {{ horarioParaAgendar.hora_inicio }} às {{ horarioParaAgendar.hora_encerramento }}</div>
        </div>
      </template>
    </ModalConfirmacao>

    <!-- Modal de Confirmação de Cancelamento -->
    <ModalConfirmacao
      v-model="modalCancelarAberto"
      titulo="Cancelar Agendamento"
      mensagem="Tem certeza que deseja cancelar esta consulta? A vaga será liberada imediatamente para outros pacientes."
      tipo="danger"
      texto-confirmar="Sim, Cancelar Consulta"
      texto-cancelar="Manter Consulta"
      :carregando="acaoCarregando"
      @confirmar="confirmarCancelamento"
    />
  </div>
</template>
