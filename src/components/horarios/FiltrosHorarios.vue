<script setup>
import { onMounted } from 'vue'
import { useHorarioStore } from '../../stores/horarios'
import { useEspecialistaStore } from '../../stores/especialistas'
import { Search, Calendar, User, Filter, RotateCcw } from 'lucide-vue-next'

const horarioStore = useHorarioStore()
const especialistaStore = useEspecialistaStore()

onMounted(() => {
  if (especialistaStore.especialistas.length === 0) {
    especialistaStore.carregarEspecialistas()
  }
})

function aplicarFiltros() {
  horarioStore.carregarHorarios()
}

function handleLimpar() {
  horarioStore.limparFiltros()
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 mb-8">
    <div class="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
      <div class="flex items-center gap-2 text-slate-800 font-bold text-base">
        <Filter class="w-5 h-5 text-blue-600" />
        Filtrar Horários
      </div>
      <button
        @click="handleLimpar"
        type="button"
        class="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        Limpar Filtros
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Filtro por Especialista -->
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Especialista / Médico
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User class="w-4 h-4" />
          </div>
          <select
            v-model="horarioStore.filtros.especialista_id"
            @change="aplicarFiltros"
            class="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          >
            <option value="">Todos os especialistas</option>
            <option
              v-for="esp in especialistaStore.especialistas"
              :key="esp.id"
              :value="esp.id"
            >
              {{ esp.nome }} — {{ esp.especialidade }}
            </option>
          </select>
        </div>
      </div>

      <!-- Filtro por Data -->
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Data da Consulta
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Calendar class="w-4 h-4" />
          </div>
          <input
            v-model="horarioStore.filtros.data_consulta"
            @change="aplicarFiltros"
            type="date"
            class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>
      </div>

      <!-- Filtro por Status -->
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Status da Vaga
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search class="w-4 h-4" />
          </div>
          <select
            v-model="horarioStore.filtros.status"
            @change="aplicarFiltros"
            class="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          >
            <option value="disponivel">Apenas vagas disponíveis</option>
            <option value="reservado">Apenas vagas reservadas</option>
            <option value="">Todos os status</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
