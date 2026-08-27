<script setup>
defineProps({
  mensagem: {
    type: String,
    default: 'Carregando...',
  },
  tamanho: {
    type: String,
    default: 'md', // 'sm', 'md', 'lg'
  },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 text-slate-500 gap-3">
    <div
      class="border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"
      :class="{
        'w-6 h-6': tamanho === 'sm',
        'w-10 h-10': tamanho === 'md',
        'w-16 h-16': tamanho === 'lg',
      }"
    ></div>
    <span v-if="mensagem" class="text-sm font-medium text-slate-600">
      {{ mensagem }}
    </span>
  </div>
</template>
