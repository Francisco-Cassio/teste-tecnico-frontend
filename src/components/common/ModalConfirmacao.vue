<script setup>
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  titulo: {
    type: String,
    default: 'Confirmar Ação',
  },
  mensagem: {
    type: String,
    default: 'Deseja realmente prosseguir com esta operação?',
  },
  tipo: {
    type: String,
    default: 'primary', // 'primary', 'danger', 'success'
  },
  textoConfirmar: {
    type: String,
    default: 'Confirmar',
  },
  textoCancelar: {
    type: String,
    default: 'Cancelar',
  },
  carregando: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirmar', 'cancelar'])

function fechar() {
  if (!props.carregando) {
    emit('update:modelValue', false)
    emit('cancelar')
  }
}

function confirmar() {
  emit('confirmar')
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
          class="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden transform transition-all"
        >
          <!-- Cabeçalho -->
          <div class="p-6 pb-4">
            <div class="flex items-start gap-4">
              <!-- Ícone -->
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                :class="{
                  'bg-rose-100 text-rose-600': tipo === 'danger',
                  'bg-emerald-100 text-emerald-600': tipo === 'success',
                  'bg-blue-100 text-blue-600': tipo === 'primary',
                }"
              >
                <AlertTriangle v-if="tipo === 'danger'" class="w-6 h-6" />
                <CheckCircle v-else-if="tipo === 'success'" class="w-6 h-6" />
                <Info v-else class="w-6 h-6" />
              </div>

              <div class="flex-1">
                <h3 class="text-lg font-bold text-slate-900 leading-tight">
                  {{ titulo }}
                </h3>
                <p class="mt-2 text-sm text-slate-600 leading-relaxed">
                  {{ mensagem }}
                </p>
                <slot name="detalhes" />
              </div>

              <button
                @click="fechar"
                type="button"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition -mr-2 -mt-2"
                :disabled="carregando"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Rodapé -->
          <div class="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              @click="fechar"
              type="button"
              :disabled="carregando"
              class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50 cursor-pointer"
            >
              {{ textoCancelar }}
            </button>
            <button
              @click="confirmar"
              type="button"
              :disabled="carregando"
              class="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
              :class="{
                'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500': tipo === 'danger',
                'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500': tipo === 'success',
                'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500': tipo === 'primary',
              }"
            >
              <span
                v-if="carregando"
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></span>
              {{ textoConfirmar }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
