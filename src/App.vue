<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTableStore } from '@/stores/table'

const tableStore = useTableStore()

onMounted(() => {
  tableStore.loadFromStorage()
})
</script>

<style scoped>
.app {
  height: 100vh;
  overflow: hidden;
}
</style>
