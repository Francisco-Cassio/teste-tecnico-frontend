<script setup>
import { watch, onUnmounted } from 'vue'
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
    default: 'primary',
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

function onKeyDown(e) {
  if (e.key === 'Escape' && props.modelValue && !props.carregando) {
    fechar()
  }
}

watch(
  () => props.modelValue,
  (aberto) => {
    if (aberto) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKeyDown)
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeyDown)
})

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
  <div
    v-if="modelValue"
    class="fixed inset-0 flex items-center justify-center p-4"
    style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 999999; background-color: rgba(15, 23, 42, 0.75); display: flex;"
    @click.self="fechar"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden my-auto relative z-10"
      style="background-color: #ffffff; color: #0f172a;"
    >
      <!-- Cabeçalho -->
      <div class="p-6 pb-4">
        <div class="flex items-start gap-4">
          <!-- Ícone -->
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
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

          <div class="flex-1 pr-2">
            <h3 class="text-lg font-bold text-slate-900 leading-tight">
              {{ titulo }}
            </h3>
            <p class="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {{ mensagem }}
            </p>
            <slot name="detalhes" />
          </div>

          <button
            @click="fechar"
            type="button"
            class="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            :disabled="carregando"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Rodapé com Botões -->
      <div class="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
        <button
          @click="fechar"
          type="button"
          :disabled="carregando"
          class="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50 cursor-pointer"
        >
          {{ textoCancelar }}
        </button>
        <button
          @click="confirmar"
          type="button"
          :disabled="carregando"
          class="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
          :class="{
            'bg-rose-600 hover:bg-rose-700': tipo === 'danger',
            'bg-emerald-600 hover:bg-emerald-700': tipo === 'success',
            'bg-blue-600 hover:bg-blue-700': tipo === 'primary',
          }"
        >
          <span
            v-if="carregando"
            class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
          ></span>
          {{ textoConfirmar }}
        </button>
      </div>
    </div>
  </div>
</template>
