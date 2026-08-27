<script setup>
import { useToastStore } from '../../stores/toast'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next'

const toastStore = useToastStore()
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all"
        :class="{
          'bg-emerald-50/95 border-emerald-200 text-emerald-900': toast.type === 'success',
          'bg-rose-50/95 border-rose-200 text-rose-900': toast.type === 'error',
          'bg-sky-50/95 border-sky-200 text-sky-900': toast.type === 'info',
        }"
      >
        <!-- Ícone -->
        <div class="shrink-0 mt-0.5">
          <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-600" />
          <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-rose-600" />
          <Info v-else class="w-5 h-5 text-sky-600" />
        </div>

        <!-- Mensagem -->
        <div class="flex-1 text-sm font-medium leading-snug">
          {{ toast.message }}
        </div>

        <!-- Botão Fechar -->
        <button
          @click="toastStore.remove(toast.id)"
          type="button"
          class="shrink-0 -mr-1 -mt-1 p-1 rounded-lg hover:bg-black/5 transition text-slate-500 hover:text-slate-700"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
