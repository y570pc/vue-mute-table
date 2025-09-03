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
        <TableContainer @performance-update="handlePerformanceUpdate" />
      </main>
    </div>
    
    <!-- 性能监控 -->
    <PerformanceMonitor
      ref="performanceMonitorRef"
      :total-records="totalRecords"
      :visible-records="visibleRecords"
    />
    
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
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import ViewTabs from '@/components/ViewTabs.vue'
import TableToolbar from '@/components/TableToolbar.vue'
import TableContainer from '@/components/TableContainer.vue'
import PerformanceMonitor from '@/components/PerformanceMonitor.vue'
import FieldManagerModal from '@/components/modals/FieldManagerModal.vue'
import FilterModal from '@/components/modals/FilterModal.vue'
import GroupModal from '@/components/modals/GroupModal.vue'
import FormGeneratorModal from '@/components/modals/FormGeneratorModal.vue'

const tableStore = useTableStore()
const performanceMonitorRef = ref()

// 模态框状态
const showFieldManager = ref(false)
const showFilterModal = ref(false)
const showGroupModal = ref(false)
const showFormGenerator = ref(false)

// 性能相关计算属性
const totalRecords = computed(() => tableStore.records.length)
const visibleRecords = computed(() => {
  // 根据当前视口计算可见记录数
  const containerHeight = 600
  const rowHeight = 48
  return Math.ceil(containerHeight / rowHeight) + 10 // 加上overscan
})

// 处理性能更新
const handlePerformanceUpdate = () => {
  performanceMonitorRef.value?.measurePerformance()
}

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
