<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAgendaStore } from '../../stores/agendas'
import { useEspecialistaStore } from '../../stores/especialistas'
import { useToastStore } from '../../stores/toast'
import { CalendarClock, User, Clock, Check, X, Save, AlertCircle, Info } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'salvo'])

const agendaStore = useAgendaStore()
const especialistaStore = useEspecialistaStore()
const toastStore = useToastStore()

const especialistaId = ref('')
const diasSelecionados = ref([0, 1, 2, 3, 4]) // Default Seg-Sex
const horaInicio = ref('08:00')
const horaEncerramento = ref('12:00')
const vagasPorDia = ref(4)
const carregando = ref(false)
const erroLocal = ref('')

const diasSemanaOpcoes = [
  { id: 0, nomeCurto: 'Seg', nomeLongo: 'Segunda-feira' },
  { id: 1, nomeCurto: 'Ter', nomeLongo: 'Terça-feira' },
  { id: 2, nomeCurto: 'Qua', nomeLongo: 'Quarta-feira' },
  { id: 3, nomeCurto: 'Qui', nomeLongo: 'Quinta-feira' },
  { id: 4, nomeCurto: 'Sex', nomeLongo: 'Sexta-feira' },
  { id: 5, nomeCurto: 'Sáb', nomeLongo: 'Sábado' },
  { id: 6, nomeCurto: 'Dom', nomeLongo: 'Domingo' },
]

onMounted(() => {
  if (especialistaStore.especialistas.length === 0) {
    especialistaStore.carregarEspecialistas()
  }
})

watch(
  () => props.modelValue,
  (aberto) => {
    if (aberto) {
      erroLocal.value = ''
      if (especialistaStore.especialistas.length > 0 && !especialistaId.value) {
        especialistaId.value = especialistaStore.especialistas[0].id
      }
    }
  }
)

function toggleDia(diaId) {
  const index = diasSelecionados.value.indexOf(diaId)
  if (index === -1) {
    diasSelecionados.value.push(diaId)
    diasSelecionados.value.sort((a, b) => a - b)
  } else {
    diasSelecionados.value.splice(index, 1)
  }
}

// Cálculo da duração estimada por vaga
const duracaoEstimada = computed(() => {
  if (!horaInicio.value || !horaEncerramento.value || !vagasPorDia.value || vagasPorDia.value <= 0) {
    return null
  }

  const [hIni, mIni] = horaInicio.value.split(':').map(Number)
  const [hFim, mFim] = horaEncerramento.value.split(':').map(Number)

  const minutosInicio = hIni * 60 + mIni
  const minutosFim = hFim * 60 + mFim

  if (minutosFim <= minutosInicio) {
    return { valido: false, mensagem: 'A hora de término deve ser posterior à hora de início.' }
  }

  const diferencaMinutos = minutosFim - minutosInicio
  const duracaoPorVaga = diferencaMinutos / vagasPorDia.value

  const horasTotais = (diferencaMinutos / 60).toFixed(1).replace('.0', '')
  return {
    valido: true,
    minutosPorVaga: Math.round(duracaoPorVaga),
    horasTotais,
  }
})

function fechar() {
  if (!carregando.value) {
    emit('update:modelValue', false)
  }
}

async function handleSubmit() {
  if (!especialistaId.value) {
    erroLocal.value = 'Selecione um especialista para vincular à agenda.'
    return
  }

  if (diasSelecionados.value.length === 0) {
    erroLocal.value = 'Selecione ao menos um dia de atendimento na semana.'
    return
  }

  if (!duracaoEstimada.value?.valido) {
    erroLocal.value = duracaoEstimada.value?.mensagem || 'Horários inválidos.'
    return
  }

  erroLocal.value = ''
  carregando.value = true

  try {
    const dados = {
      especialista: Number(especialistaId.value),
      dias_semana: diasSelecionados.value,
      hora_inicio: horaInicio.value,
      hora_encerramento: horaEncerramento.value,
      vagas_por_dia: Number(vagasPorDia.value),
    }

    await agendaStore.criarAgenda(dados)
    toastStore.success('Agenda criada e horários para os próximos 30 dias gerados com sucesso!')
    emit('salvo')
    emit('update:modelValue', false)
  } catch (err) {
    erroLocal.value = err.message || 'Erro ao cadastrar agenda.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        @click.self="fechar"
      >
        <div
          class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden transform transition-all max-h-[90vh] flex flex-col"
        >
          <!-- Cabeçalho -->
          <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <CalendarClock class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 leading-tight">
                  Nova Agenda Semanal
                </h3>
                <p class="text-xs text-slate-500">
                  Gera automaticamente vagas para os próximos 30 dias
                </p>
              </div>
            </div>

            <button
              @click="fechar"
              type="button"
              class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              :disabled="carregando"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Formulário com Scroll -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4 overflow-y-auto flex-1">
            <!-- Alerta Informativo de Geração Automática -->
            <div class="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-blue-900 text-xs leading-relaxed">
              <Info class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Geração Automática:</strong> O backend criará todas as vagas de consulta para os dias selecionados no período de <strong>30 dias corridos</strong> a partir de hoje.
              </span>
            </div>

            <!-- Erro -->
            <div
              v-if="erroLocal"
              class="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-medium"
            >
              <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
              <span>{{ erroLocal }}</span>
            </div>

            <!-- Seleção do Especialista -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Especialista *
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User class="w-4 h-4" />
                </div>
                <select
                  v-model="especialistaId"
                  required
                  class="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                >
                  <option value="" disabled>Selecione um médico...</option>
                  <option
                    v-for="esp in especialistaStore.especialistas"
                    :key="esp.id"
                    :value="esp.id"
                  >
                    {{ esp.nome }} ({{ esp.especialidade }})
                  </option>
                </select>
              </div>
            </div>

            <!-- Dias da Semana -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Dias de Atendimento na Semana *
              </label>
              <div class="grid grid-cols-7 gap-1.5">
                <button
                  v-for="dia in diasSemanaOpcoes"
                  :key="dia.id"
                  type="button"
                  @click="toggleDia(dia.id)"
                  class="py-2 px-1 text-center rounded-xl text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer border"
                  :class="
                    diasSelecionados.includes(dia.id)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  "
                >
                  {{ dia.nomeCurto }}
                </button>
              </div>
            </div>

            <!-- Horários de Início e Término -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hora de Início *
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Clock class="w-4 h-4" />
                  </div>
                  <input
                    v-model="horaInicio"
                    type="time"
                    required
                    class="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hora de Término *
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Clock class="w-4 h-4" />
                  </div>
                  <input
                    v-model="horaEncerramento"
                    type="time"
                    required
                    class="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>
              </div>
            </div>

            <!-- Vagas Diárias -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Quantidade de Vagas por Dia *
              </label>
              <input
                v-model.number="vagasPorDia"
                type="number"
                min="1"
                max="50"
                required
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            <!-- Cálculo Visual da Duração por Consulta -->
            <div
              v-if="duracaoEstimada"
              class="p-3 rounded-xl text-xs font-semibold"
              :class="
                duracaoEstimada.valido
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              "
            >
              <div v-if="duracaoEstimada.valido" class="flex items-center justify-between">
                <span>Total: {{ duracaoEstimada.horasTotais }}h de atendimento</span>
                <span class="font-bold">⏱️ {{ duracaoEstimada.minutosPorVaga }} min / consulta</span>
              </div>
              <div v-else>
                {{ duracaoEstimada.mensagem }}
              </div>
            </div>

            <!-- Botões de Ação -->
            <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
              <button
                @click="fechar"
                type="button"
                :disabled="carregando"
                class="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="carregando || !duracaoEstimada?.valido"
                class="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                <span
                  v-if="carregando"
                  class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
                <Save v-else class="w-4 h-4" />
                Criar Agenda & Gerar Horários
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
