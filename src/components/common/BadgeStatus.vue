<script setup>
defineProps({
  status: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <span
    v-if="status === 'disponivel'"
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
  >
    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
    Disponível
  </span>
  <span
    v-else-if="status === 'reservado'"
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"
  >
    <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
    Reservado
  </span>
  <span
    v-else
    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
  >
    {{ status }}
  </span>
</template>
