<script setup>
import { ref, watch } from 'vue'
import { useEspecialistaStore } from '../../stores/especialistas'
import { useToastStore } from '../../stores/toast'
import { User, Stethoscope, Mail, X, Save, AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  especialista: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'salvo'])

const especialistaStore = useEspecialistaStore()
const toastStore = useToastStore()

const nome = ref('')
const especialidade = ref('')
const email = ref('')
const carregando = ref(false)
const erroLocal = ref('')

const especialidadesSugeridas = [
  'Cardiologia',
  'Ortopedia',
  'Dermatologia',
  'Pediatria',
  'Ginecologia e Obstetrícia',
  'Neurologia',
  'Oftalmologia',
  'Psiquiatria',
  'Endocrinologia',
  'Clínica Geral',
]

watch(
  () => props.modelValue,
  (aberto) => {
    if (aberto) {
      erroLocal.value = ''
      if (props.especialista) {
        nome.value = props.especialista.nome || ''
        especialidade.value = props.especialista.especialidade || ''
        email.value = props.especialista.email || ''
      } else {
        nome.value = ''
        especialidade.value = ''
        email.value = ''
      }
    }
  }
)

function fechar() {
  if (!carregando.value) {
    emit('update:modelValue', false)
  }
}

async function handleSubmit() {
  if (!nome.value || !especialidade.value || !email.value) {
    erroLocal.value = 'Preencha todos os campos obrigatórios.'
    return
  }

  erroLocal.value = ''
  carregando.value = true

  try {
    const dados = {
      nome: nome.value,
      especialidade: especialidade.value,
      email: email.value,
    }

    if (props.especialista?.id) {
      await especialistaStore.atualizarEspecialista(props.especialista.id, dados)
      toastStore.success('Especialista atualizado com sucesso!')
    } else {
      await especialistaStore.criarEspecialista(dados)
      toastStore.success('Especialista cadastrado com sucesso!')
    }

    emit('salvo')
    emit('update:modelValue', false)
  } catch (err) {
    erroLocal.value = err.message || 'Erro ao salvar especialista.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        @click.self="fechar"
      >
        <div
          class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden transform transition-all"
        >
          <!-- Cabeçalho -->
          <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Stethoscope class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 leading-tight">
                  {{ especialista ? 'Editar Especialista' : 'Novo Especialista' }}
                </h3>
                <p class="text-xs text-slate-500">
                  Preencha os dados do profissional de saúde
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

          <!-- Conteúdo / Formulário -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
            <!-- Erro -->
            <div
              v-if="erroLocal"
              class="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-medium"
            >
              <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
              <span>{{ erroLocal }}</span>
            </div>

            <!-- Nome -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome Completo *
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User class="w-4 h-4" />
                </div>
                <input
                  v-model="nome"
                  type="text"
                  required
                  placeholder="Ex: Dra. Ana Beatriz Silva"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <!-- Especialidade com Datalist -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Especialidade Médica *
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Stethoscope class="w-4 h-4" />
                </div>
                <input
                  v-model="especialidade"
                  type="text"
                  required
                  list="lista-especialidades"
                  placeholder="Ex: Cardiologia"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
                <datalist id="lista-especialidades">
                  <option v-for="esp in especialidadesSugeridas" :key="esp" :value="esp" />
                </datalist>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                E-mail Profissional *
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail class="w-4 h-4" />
                </div>
                <input
                  v-model="email"
                  type="email"
                  required
                  placeholder="medico@clinica.com"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <!-- Rodapé -->
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
                :disabled="carregando"
                class="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition disabled:opacity-60 cursor-pointer"
              >
                <span
                  v-if="carregando"
                  class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
                <Save v-else class="w-4 h-4" />
                {{ especialista ? 'Salvar Alterações' : 'Cadastrar Especialista' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>

