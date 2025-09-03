<template>
  <div class="view-tabs">
    <div
        v-for="view in views"
        :key="view.id"
        class="view-tab"
        :class="{ active: currentViewId === view.id }"
        @click="switchView(view.id)"
    >
      <component :is="getViewIcon(view.type)" class="w-4 h-4" />
      {{ view.name }}
    </div>
    <button class="add-view-btn" @click="showAddViewModal = true">
      <Plus class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus, Table, Grid, FileText, Calendar } from 'lucide-vue-next'
import { useTableStore } from '@/stores/table'

const tableStore = useTableStore()
const showAddViewModal = ref(false)

const views = computed(() => tableStore.views)
const currentViewId = computed(() => tableStore.currentViewId)

const getViewIcon = (type: string) => {
  const iconMap = {
    table: Table,
    kanban: Grid,
    form: FileText,
    calendar: Calendar
  }
  return iconMap[type as keyof typeof iconMap] || Table
}

const switchView = (viewId: string) => {
  tableStore.switchView(viewId)
}
</script>

<style scoped>
.view-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 16px 20px 0;
  background: white;
}

.view-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-bottom: none;
  transition: all 0.2s;
}

.view-tab:hover {
  background: #f1f5f9;
}

.view-tab.active {
  background: white;
  color: #1e293b;
  font-weight: 500;
  border-color: #e2e8f0;
}

.add-view-btn {
  padding: 8px;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: background-color 0.2s;
}

.add-view-btn:hover {
  background: #f1f5f9;
}

@media (max-width: 768px) {
  .view-tabs {
    padding: 12px 16px 0;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .view-tabs::-webkit-scrollbar {
    display: none;
  }

  .view-tab {
    white-space: nowrap;
    flex-shrink: 0;
  }
}
</style>
