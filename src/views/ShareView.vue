<template>
  <div class="table-view">
    
    <div class="main-content">
      
      <!-- 主要内容区域 -->
      <main class="content">
        
        <!-- 表格容器 -->
        <TableContainer :data="tableData" />
      </main>
    </div>
    

    
    <!-- 模态框 -->
    <FieldManagerModal v-if="showFieldManager" @close="showFieldManager = false" />
    <FilterModal v-if="showFilterModal" @close="showFilterModal = false" />
    <GroupModal v-if="showGroupModal" @close="showGroupModal = false" />
    <FormGeneratorModal v-if="showFormGenerator" @close="showFormGenerator = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { useTableStore } from '@/stores/table'
import TableContainer from '@/components/TableContainer.vue'
import FieldManagerModal from '@/components/modals/FieldManagerModal.vue'
import FilterModal from '@/components/modals/FilterModal.vue'
import GroupModal from '@/components/modals/GroupModal.vue'
import FormGeneratorModal from '@/components/modals/FormGeneratorModal.vue'

const tableStore = useTableStore()

// 模态框状态
const showFieldManager = ref(false)
const showFilterModal = ref(false)
const showGroupModal = ref(false)
const showFormGenerator = ref(false)

const props = defineProps<{ data: any[] }>()
const tableData = computed(() => props.data || [])


// 提供给子组件使用
provide('showFieldManager', showFieldManager)
provide('showFilterModal', showFilterModal)
provide('showGroupModal', showGroupModal)
provide('showFormGenerator', showFormGenerator)
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
