<template>
  <div class="table-view">
    <!-- 顶部导航栏 -->
    <AppHeader />
    
    <div class="main-content">
      <!-- 侧边栏 -->
      <AppSidebar />
      
      <!-- 主要内容区域 -->
      <main class="content">
        <!-- 视图标签 -->
<!--        <ViewTabs />-->
        
        <!-- 工具栏 -->
        <TableToolbar />
        
        <!-- 表格容器 -->
        <TableContainer />
      </main>
    </div>
    

    
    <!-- 模态框 -->
    <FieldManagerModal v-if="showFieldManager" @close="showFieldManager = false" />
    <FilterModal 
      v-if="showFilterModal" 
      :show="showFilterModal"
      :fields="tableStore.fields"
      :filters="tableStore.filters"
      @close="showFilterModal = false" 
      @apply="applyFilters"
    />
    <GroupModal v-if="showGroupModal" @close="showGroupModal = false" />
    <FormGeneratorModal v-if="showFormGenerator" @close="showFormGenerator = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { useTableStore } from '@/stores/table'
import type { FilterCondition } from '@/types';
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import ViewTabs from '@/components/ViewTabs.vue'
import TableToolbar from '@/components/TableToolbar.vue'
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

const applyFilters = (newFilters: FilterCondition[]) => {
  tableStore.updateFilters(newFilters);
  showFilterModal.value = false; // Close modal on apply
};


// 提供给子组件使用
provide('showFieldManager', showFieldManager)
provide('showFilterModal', showFilterModal)
provide('showGroupModal', showGroupModal)
provide('showFormGenerator', showFormGenerator)
</script>

<style scoped>
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
