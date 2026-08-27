<script setup>
import { ref, onMounted } from 'vue'
import { useAgendaStore } from '../../stores/agendas'
import { useToastStore } from '../../stores/toast'
import ModalAgenda from '../../components/agendas/ModalAgenda.vue'
import ModalConfirmacao from '../../components/common/ModalConfirmacao.vue'
import LoadingSpinner from '../../components/common/LoadingSpinner.vue'
import {
  CalendarClock,
  Plus,
  Trash2,
  Stethoscope,
  Calendar,
  Clock,
  Users,
  AlertCircle,
} from 'lucide-vue-next'

const agendaStore = useAgendaStore()
const toastStore = useToastStore()

const modalCriarAberto = ref(false)
const modalExcluirAberto = ref(false)
const agendaParaExcluir = ref(null)
const excluindo = ref(false)

const nomesDias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const nomesDiasCurtos = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

onMounted(() => {
  agendaStore.carregarAgendas()
})

function formatarDias(dias) {
  if (!Array.isArray(dias)) return ''
  return dias.map(d => nomesDiasCurtos[d]).join(', ')
}

function iniciarExclusao(agenda) {
  agendaParaExcluir.value = agenda
  modalExcluirAberto.value = true
}

async function confirmarExclusao() {
  if (!agendaParaExcluir.value) return
  excluindo.value = true
  try {
    await agendaStore.excluirAgenda(agendaParaExcluir.value.id)
    toastStore.success('Agenda e horários livres inativados com sucesso.')
    modalExcluirAberto.value = false
    agendaParaExcluir.value = null
  } catch (err) {
    toastStore.error(err.message || 'Erro ao excluir agenda.')
  } finally {
    excluindo.value = false
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2.5 mb-1">
          <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <CalendarClock class="w-5 h-5" />
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Gestão de Agendas
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">
          Configure a grade de horários semanais dos especialistas da clínica
        </p>
      </div>

      <button
        @click="modalCriarAberto = true"
        type="button"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        Nova Agenda
      </button>
    </div>

    <!-- Carregando -->
    <div v-if="agendaStore.loading && agendaStore.agendas.length === 0" class="py-16">
      <LoadingSpinner mensagem="Carregando agendas configuradas..." />
    </div>

    <!-- Erro -->
    <div
      v-else-if="agendaStore.error"
      class="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center my-8 max-w-lg mx-auto"
    >
      <AlertCircle class="w-8 h-8 text-rose-600 mx-auto mb-2" />
      <h3 class="font-bold text-rose-900 mb-1">Erro ao buscar agendas</h3>
      <p class="text-sm text-rose-700 mb-4">{{ agendaStore.error }}</p>
      <button
        @click="agendaStore.carregarAgendas()"
        type="button"
        class="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition cursor-pointer"
      >
        Tentar novamente
      </button>
    </div>

    <!-- Conteúdo -->
    <div v-else>
      <!-- Vazio -->
      <div
        v-if="agendaStore.agendas.length === 0"
        class="bg-white rounded-3xl border border-slate-200/80 p-12 text-center my-6 max-w-md mx-auto shadow-xs"
      >
        <div class="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mx-auto mb-4">
          <CalendarClock class="w-8 h-8" />
        </div>
        <h3 class="font-bold text-slate-800 text-lg mb-1">Nenhuma agenda cadastrada</h3>
        <p class="text-xs text-slate-500 mb-6 leading-relaxed">
          Crie a primeira agenda para gerar automaticamente os horários de consulta dos próximos 30 dias.
        </p>
        <button
          @click="modalCriarAberto = true"
          type="button"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          Cadastrar Agenda
        </button>
      </div>

      <!-- Grid de Agendas -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="agenda in agendaStore.agendas"
          :key="agenda.id"
          class="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition p-6 flex flex-col justify-between"
        >
          <div>
            <!-- Médico -->
            <div class="flex items-start justify-between gap-3 mb-4">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                  <Stethoscope class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 text-base leading-snug">
                    {{ agenda.especialista?.nome || 'Especialista' }}
                  </h3>
                  <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 mt-1">
                    {{ agenda.especialista?.especialidade || 'Geral' }}
                  </span>
                </div>
              </div>

              <button
                @click="iniciarExclusao(agenda)"
                title="Excluir Agenda (Soft Delete)"
                type="button"
                class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <!-- Dados da Grade -->
            <div class="bg-slate-50 rounded-xl p-4 space-y-2.5 border border-slate-100 text-xs mb-4">
              <!-- Dias da Semana -->
              <div class="flex items-center gap-2">
                <Calendar class="w-4 h-4 text-indigo-600 shrink-0" />
                <span class="text-slate-600">Dias:</span>
                <span class="font-bold text-slate-900">{{ formatarDias(agenda.dias_semana) }}</span>
              </div>

              <!-- Horário -->
              <div class="flex items-center gap-2">
                <Clock class="w-4 h-4 text-indigo-600 shrink-0" />
                <span class="text-slate-600">Horário:</span>
                <span class="font-bold text-slate-900">{{ agenda.hora_inicio }} às {{ agenda.hora_encerramento }}</span>
              </div>

              <!-- Vagas -->
              <div class="flex items-center gap-2">
                <Users class="w-4 h-4 text-indigo-600 shrink-0" />
                <span class="text-slate-600">Vagas Diárias:</span>
                <span class="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {{ agenda.vagas_por_dia }} consultas / dia
                </span>
              </div>
            </div>
          </div>

          <!-- Rodapé do Card -->
          <div class="text-[11px] text-slate-400 border-t border-slate-100 pt-3 flex items-center justify-between">
            <span>Agenda ID #{{ agenda.id }}</span>
            <span class="text-emerald-600 font-semibold flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ativa
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Criação de Agenda -->
    <ModalAgenda
      v-model="modalCriarAberto"
      @salvo="agendaStore.carregarAgendas()"
    />

    <!-- Modal de Confirmação de Exclusão -->
    <ModalConfirmacao
      v-model="modalExcluirAberto"
      titulo="Inativar Agenda"
      mensagem="Tem certeza que deseja inativar esta agenda? Todos os horários disponíveis ainda não reservados vinculados a ela serão removidos (Soft Delete)."
      tipo="danger"
      texto-confirmar="Sim, Inativar Agenda"
      texto-cancelar="Cancelar"
      :carregando="excluindo"
      @confirmar="confirmarExclusao"
    >
      <template #detalhes v-if="agendaParaExcluir">
        <div class="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1 text-rose-950">
          <div><strong>Médico(a):</strong> {{ agendaParaExcluir.especialista?.nome }}</div>
          <div><strong>Dias:</strong> {{ formatarDias(agendaParaExcluir.dias_semana) }}</div>
          <div><strong>Horário:</strong> {{ agendaParaExcluir.hora_inicio }} às {{ agendaParaExcluir.hora_encerramento }}</div>
        </div>
      </template>
    </ModalConfirmacao>
  </div>
</template>
