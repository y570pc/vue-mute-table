<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>设置筛选条件</h3>
        <button @click="$emit('close')" class="close-btn">
          <X class="w-4 h-4" />
        </button>

      </div>
      <div class="modal-body">
        <div class="logic-select">
          <select v-model="logic" class="logic-dropdown">
            <option value="and">满足所有条件</option>
            <option value="or">满足任一条件</option>
          </select>
        </div>

        <div v-for="(filter, idx) in filters" :key="idx" class="filter-row">
          <select v-model="filter.field" class="filter-field">
            <option v-for="f in fields" :key="f.id" :value="f.id">{{ f.name }}</option>
          </select>
          <select v-model="filter.operator" class="filter-operator">
            <option v-for="op in getOperators(filter.field)" :key="op.value" :value="op.value">{{ op.label }}</option>
          </select>
          <input v-model="filter.value" class="filter-value" :placeholder="getPlaceholder(filter.field)" />
          <button class="remove-btn" @click="removeFilter(idx)">－</button>
        </div>
        <button class="add-btn" @click="addFilter">＋ 筛选条件</button>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary">取消</button>
        <button class="btn-primary" @click="applyFilters">应用筛选</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { X } from 'lucide-vue-next'

const emit = defineEmits(['close', 'apply'])

// 示例字段，可替换为props传入
const fields = [
  { id: 'a', name: '文本', type: 'text' },
  { id: 'b', name: '数字', type: 'number' },
  { id: 'c', name: '日期', type: 'date' },
]

const logic = ref('and')
const filters = ref([
  { field: 'a', operator: 'eq', value: '' }
])

const getOperators = (fieldId: string) => {
  const field = fields.find(f => f.id === fieldId)
  if (!field) return []
  if (field.type === 'text') {
    return [
      { value: 'eq', label: '指定值' },
      { value: 'neq', label: '不等于' },
      { value: 'contains', label: '包含' },
      { value: 'notcontains', label: '不包含' }
    ]
  }
  if (field.type === 'number') {
    return [
      { value: 'eq', label: '等于' },
      { value: 'neq', label: '不等于' },
      { value: 'gt', label: '大于' },
      { value: 'lt', label: '小于' },
      { value: 'gte', label: '大于等于' },
      { value: 'lte', label: '小于等于' }
    ]
  }
  if (field.type === 'date') {
    return [
      { value: 'eq', label: '等于' },
      { value: 'before', label: '早于' },
      { value: 'after', label: '晚于' }
    ]
  }
  return []
}

const getPlaceholder = (fieldId: string) => {
  const field = fields.find(f => f.id === fieldId)
  if (!field) return ''
  if (field.type === 'text') return '输入文本...'
  if (field.type === 'number') return '输入数字...'
  if (field.type === 'date') return '输入日期...'
  return ''
}

const addFilter = () => {
  filters.value.push({ field: fields[0].id, operator: 'eq', value: '' })
}
const removeFilter = (idx: number) => {
  filters.value.splice(idx, 1)
}
const applyFilters = () => {
  emit('apply', { logic: logic.value, filters: filters.value })
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 700px;
  max-width: 96vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 24px 24px 16px 24px;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.logic-select {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
.logic-dropdown {
  border: none;
  background: transparent;
  font-size: 15px;
  color: #555;
  font-weight: 500;
  margin-bottom: 10px;
}
.modal-body {
  margin-bottom: 16px;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.filter-field, .filter-operator, .filter-value {
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 15px;
  min-width: 120px;
}
.filter-value {
  min-width: 180px;
}
.remove-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 22px;
  cursor: pointer;
  margin-left: 4px;
}
.add-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 16px;
  cursor: pointer;
  margin-top: 8px;
  margin-bottom: 8px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.btn-secondary, .btn-primary {
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 15px;
  border: none;
  cursor: pointer;
}
.btn-secondary {
  background: #f3f4f6;
  color: #555;
}
.btn-primary {
  background: #3b82f6;
  color: #fff;
}
</style>

<!-- .modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  padding: 4px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
} -->
