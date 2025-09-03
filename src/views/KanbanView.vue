<template>
  <div class="kanban-view">
    <AppHeader />
    
    <div class="main-content">
      <AppSidebar />
      
      <main class="content">
        
        <div class="kanban-container">
          <div class="kanban-board">
            <div 
              v-for="group in groupedRecords" 
              :key="group.key"
              class="kanban-column"
            >
              <div class="column-header">
                <div class="column-title" :style="{ color: group.color }">
                  {{ group.label }}
                </div>
                <div class="column-count">{{ group.records.length }}</div>
              </div>
              
              <div class="column-content">
                <div 
                  v-for="record in group.records"
                  :key="record.id"
                  class="kanban-card"
                  @click="editRecord(record)"
                >
                  <div class="card-title">{{ record.title }}</div>
                  <div class="card-details">{{ record.details }}</div>
                  <div class="card-meta">
                    <div class="card-assignee">
                      <User class="w-4 h-4" />
                      {{ record.assignee }}
                    </div>
                    <div class="card-date">
                      <Calendar class="w-4 h-4" />
                      {{ formatDate(record.endDate) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User, Calendar } from 'lucide-vue-next'
import { useTableStore } from '@/stores/table'
import { formatDate } from '@/utils'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import ViewTabs from '@/components/ViewTabs.vue'

const tableStore = useTableStore()

const groupedRecords = computed(() => tableStore.groupedRecords)

const editRecord = (record: any) => {
  // 编辑记录逻辑
  console.log('Edit record:', record)
}
</script>

<style scoped>
.kanban-view {
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

.kanban-container {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.kanban-board {
  display: flex;
  gap: 20px;
  min-height: 100%;
}

.kanban-column {
  flex: 1;
  min-width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.column-header {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.column-title {
  font-weight: 600;
  font-size: 16px;
}

.column-count {
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.column-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kanban-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.kanban-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-title {
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 8px;
}

.card-details {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
  line-height: 1.4;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
}

.card-assignee,
.card-date {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
