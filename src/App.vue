<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/common/Navbar.vue'
import ToastNotification from './components/common/ToastNotification.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
    <ToastNotification />
    <Navbar />
    
    <main class="flex-1">
      <RouterView />
    </main>

    <footer class="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 LunaMed — Sistema de Gerenciamento de Consultas.</p>
        <p class="text-slate-400">Desenvolvido para Teste Técnico</p>
      </div>
    </footer>
  </div>
</template>
