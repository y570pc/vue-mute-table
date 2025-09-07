<template>
  <div class="table-view">
    
    <div class="main-content">
      
      <!-- 主要内容区域 -->
      <main class="content">
        
        <!-- 表格容器 -->
        <TableContainer />
      </main>
    </div>
  
    
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { useTableStore } from '@/stores/table'
import TableContainer from '@/components/TableContainer.vue'
import type { Field, Record } from '@/types' // Importing types for clarity

// 1. Define props to receive 'fields' and 'records' from the parent
const props = defineProps<{
  fields: Field[];
  records: Record[];
}>()

const tableStore = useTableStore()

// 2. Use watchEffect to reactively update the store whenever the props change
watchEffect(() => {
  if (props.fields && props.records) {
    // 3. Call the new store action to load the shared data
    tableStore.loadShareData(props.fields, props.records);
  }
});


</script>

<style>


.table-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
