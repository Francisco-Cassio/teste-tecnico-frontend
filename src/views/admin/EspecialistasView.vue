<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEspecialistaStore } from '../../stores/especialistas'
import { useToastStore } from '../../stores/toast'
import ModalEspecialista from '../../components/especialistas/ModalEspecialista.vue'
import ModalConfirmacao from '../../components/common/ModalConfirmacao.vue'
import LoadingSpinner from '../../components/common/LoadingSpinner.vue'
import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  Stethoscope,
  Mail,
  AlertCircle,
} from 'lucide-vue-next'

const especialistaStore = useEspecialistaStore()
const toastStore = useToastStore()

const busca = ref('')
const modalFormAberto = ref(false)
const especialistaEmEdicao = ref(null)

const modalExcluirAberto = ref(false)
const especialistaParaExcluir = ref(null)
const excluindo = ref(false)

onMounted(() => {
  especialistaStore.carregarEspecialistas()
})

const especialistasFiltrados = computed(() => {
  if (!busca.value.trim()) return especialistaStore.especialistas
  const termo = busca.value.toLowerCase()
  return especialistaStore.especialistas.filter(
    (e) =>
      e.nome?.toLowerCase().includes(termo) ||
      e.especialidade?.toLowerCase().includes(termo) ||
      e.email?.toLowerCase().includes(termo)
  )
})

function abrirCriacao() {
  especialistaEmEdicao.value = null
  modalFormAberto.value = true
}

function abrirEdicao(especialista) {
  especialistaEmEdicao.value = { ...especialista }
  modalFormAberto.value = true
}

function iniciarExclusao(especialista) {
  especialistaParaExcluir.value = especialista
  modalExcluirAberto.value = true
}

async function confirmarExclusao() {
  if (!especialistaParaExcluir.value) return
  excluindo.value = true
  try {
    await especialistaStore.excluirEspecialista(especialistaParaExcluir.value.id)
    toastStore.success('Especialista inativado com sucesso.')
    modalExcluirAberto.value = false
    especialistaParaExcluir.value = null
  } catch (err) {
    toastStore.error(err.message || 'Erro ao excluir especialista.')
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
            <Users class="w-5 h-5" />
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Gestão de Especialistas
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">
          Cadastre, edite e gerencie o corpo clínico da clínica
        </p>
      </div>

      <button
        @click="abrirCriacao"
        type="button"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        Novo Especialista
      </button>
    </div>

    <!-- Barra de Busca -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-xs flex items-center gap-3">
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search class="w-4 h-4" />
        </div>
        <input
          v-model="busca"
          type="text"
          placeholder="Buscar por nome, especialidade ou e-mail..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
        />
      </div>
      <span class="text-xs font-semibold text-slate-500 hidden sm:block whitespace-nowrap">
        {{ especialistasFiltrados.length }} especialista(s)
      </span>
    </div>

    <!-- Carregando -->
    <div v-if="especialistaStore.loading && especialistaStore.especialistas.length === 0" class="py-16">
      <LoadingSpinner mensagem="Carregando lista de especialistas..." />
    </div>

    <!-- Erro -->
    <div
      v-else-if="especialistaStore.error"
      class="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center my-8 max-w-lg mx-auto"
    >
      <AlertCircle class="w-8 h-8 text-rose-600 mx-auto mb-2" />
      <h3 class="font-bold text-rose-900 mb-1">Erro ao carregar especialistas</h3>
      <p class="text-sm text-rose-700 mb-4">{{ especialistaStore.error }}</p>
      <button
        @click="especialistaStore.carregarEspecialistas()"
        type="button"
        class="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition cursor-pointer"
      >
        Tentar novamente
      </button>
    </div>

    <!-- Tabela / Lista -->
    <div v-else class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <!-- Vazio -->
      <div
        v-if="especialistasFiltrados.length === 0"
        class="p-12 text-center"
      >
        <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
          <Stethoscope class="w-7 h-7" />
        </div>
        <h3 class="font-bold text-slate-800 text-sm mb-1">Nenhum especialista encontrado</h3>
        <p class="text-xs text-slate-500 mb-4">
          {{ busca ? 'Nenhum resultado corresponde aos termos da busca.' : 'Nenhum especialista cadastrado ainda.' }}
        </p>
        <button
          v-if="!busca"
          @click="abrirCriacao"
          type="button"
          class="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          Cadastrar primeiro especialista
        </button>
      </div>

      <!-- Tabela Desktop -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th class="py-3.5 px-6">Nome do Especialista</th>
              <th class="py-3.5 px-6">Especialidade</th>
              <th class="py-3.5 px-6">E-mail</th>
              <th class="py-3.5 px-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr
              v-for="esp in especialistasFiltrados"
              :key="esp.id"
              class="hover:bg-slate-50/60 transition group"
            >
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {{ esp.nome?.charAt(0) }}
                  </div>
                  <span class="font-bold text-slate-900">{{ esp.nome }}</span>
                </div>
              </td>
              <td class="py-4 px-6">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {{ esp.especialidade }}
                </span>
              </td>
              <td class="py-4 px-6 text-slate-600 text-xs font-medium">
                {{ esp.email }}
              </td>
              <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="abrirEdicao(esp)"
                    title="Editar Especialista"
                    class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                  >
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button
                    @click="iniciarExclusao(esp)"
                    title="Inativar Especialista"
                    class="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Cadastro / Edição -->
    <ModalEspecialista
      v-model="modalFormAberto"
      :especialista="especialistaEmEdicao"
      @salvo="especialistaStore.carregarEspecialistas()"
    />

    <!-- Modal de Confirmação de Exclusão -->
    <ModalConfirmacao
      v-model="modalExcluirAberto"
      titulo="Inativar Especialista"
      mensagem="Tem certeza que deseja inativar este especialista? Suas agendas ativas e horários livres vinculados também serão cancelados."
      tipo="danger"
      texto-confirmar="Sim, Inativar"
      texto-cancelar="Cancelar"
      :carregando="excluindo"
      @confirmar="confirmarExclusao"
    >
      <template #detalhes v-if="especialistaParaExcluir">
        <div class="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1 text-rose-950">
          <div><strong>Nome:</strong> {{ especialistaParaExcluir.nome }}</div>
          <div><strong>Especialidade:</strong> {{ especialistaParaExcluir.especialidade }}</div>
          <div><strong>E-mail:</strong> {{ especialistaParaExcluir.email }}</div>
        </div>
      </template>
    </ModalConfirmacao>
  </div>
</template>

