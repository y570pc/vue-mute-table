<template>
  <div class="table-toolbar">
    <div class="toolbar-left">
      <button class="toolbar-btn primary" @click="addRecord">
        <Plus class="w-4 h-4" />
        添加记录
      </button>
      <button class="toolbar-btn" @click="toggleFieldManager">
        <Settings class="w-4 h-4" />
        字段配置
      </button>
      <button class="toolbar-btn" @click="toggleFilterModal">
        <Filter class="w-4 h-4" />
        筛选
        <span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
      </button>
      <button class="toolbar-btn" @click="toggleSortModal">
        <ArrowUpDown class="w-4 h-4" />
        表单配置
      </button>
    </div>
    <div class="toolbar-right">
      <input
        type="file"
        ref="fileInput"
        @change="handleFileImport"
        accept=".json"
        style="display: none"
      />
      <button class="toolbar-btn" @click="triggerFileInput">
        <Upload class="w-4 h-4" />
        导入
      </button>
      <button class="toolbar-btn" @click="exportData">
        <Download class="w-4 h-4" />
        导出
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import {
  Plus,
  Settings,
  Eye,
  Filter,
  Layers,
  ArrowUpDown,
  FileText,
  Download,
  Upload
} from 'lucide-vue-next'
import { useRouter } from "vue-router"
import { useTableStore } from '@/stores/table'

const tableStore = useTableStore()

const router = useRouter()

// 从父组件注入的模态框状态
const showFieldManager = inject<Ref<boolean>>('showFieldManager')
const showFilterModal = inject<Ref<boolean>>('showFilterModal')
const showGroupModal = inject<Ref<boolean>>('showGroupModal')
const showFormGenerator = inject<Ref<boolean>>('showFormGenerator')

const showViewConfig = ref(false)
const showSortModal = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)


const activeFiltersCount = computed(() => tableStore.filters.length)
const activeSortsCount = computed(() => tableStore.sorts.length)
const groupBy = computed(() => tableStore.groupBy)

const addRecord = () => {
  tableStore.addRecord()
}

const generateForm = () => {
  if (showFormGenerator) {
    showFormGenerator.value = true
  }
}

const exportData = () => {
  tableStore.exportData()
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    if (content) {
      tableStore.importData(content);
    }
  };
  reader.readAsText(file);
  // Reset the input value to allow re-uploading the same file
  target.value = '';
};

const toggleFieldManager = () => {
  if (showFieldManager) {
    showFieldManager.value = !showFieldManager.value
  }
}

const toggleViewConfig = () => {
  showViewConfig.value = !showViewConfig.value
}

const toggleFilterModal = () => {
  if (showFilterModal) {
    showFilterModal.value = !showFilterModal.value
  }
}

const toggleGroupModal = () => {
  if (showGroupModal) {
    showGroupModal.value = !showGroupModal.value
  }
}

const toggleSortModal = () => {
  router.push('/form')
}
</script>

<style scoped>
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
  position: relative;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #f8fafc;
}

.toolbar-btn.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.toolbar-btn.primary:hover {
  background: #2563eb;
}

.filter-badge,
.sort-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    justify-content: center;
    flex-wrap: wrap;
  }

  .toolbar-btn {
    font-size: 12px;
    padding: 6px 8px;
  }
}
</style>
