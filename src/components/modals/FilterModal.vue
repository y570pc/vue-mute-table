<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>筛选</h3>
        <button @click="close" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div v-for="(condition, index) in localFilters" :key="index" class="filter-condition">
          <select v-model="condition.fieldId" class="filter-select">
            <option disabled value="">选择字段</option>
            <option v-for="field in fields" :key="field.id" :value="field.id">
              {{ field.name }}
            </option>
          </select>
          <select v-model="condition.operator" class="filter-select">
            <option disabled value="">选择操作</option>
            <option v-for="op in operators" :key="op.value" :value="op.value">
              {{ op.label }}
            </option>
          </select>
          <input v-model="condition.value" type="text" class="filter-input" placeholder="输入值" />
          <button @click="removeFilter(index)" class="remove-filter-btn">-</button>
        </div>
        <button @click="addFilter" class="add-filter-btn">+ 添加筛选条件</button>
      </div>
      <div class="modal-footer">
        <button @click="close" class="btn-secondary">取消</button>
        <button @click="applyFilters" class="btn-primary">应用</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import type { FilterCondition, Field } from '@/types';

const props = defineProps<{
  show: boolean;
  fields: Field[];
  filters: FilterCondition[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'apply', filters: FilterCondition[]): void;
}>();

const localFilters = ref<FilterCondition[]>([]);

const operators = [
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'contains', label: '包含' },
  { value: 'not_contains', label: '不包含' },
  { value: 'starts_with', label: '开头是' },
  { value: 'ends_with', label: '结尾是' },
  { value: 'is_empty', label: '为空' },
  { value: 'is_not_empty', label: '不为空' },
];

watch(() => props.show, (newVal) => {
  if (newVal) {
    // Deep copy the filters to allow for local, non-reactive changes
    localFilters.value = JSON.parse(JSON.stringify(props.filters));
  }
});

const addFilter = () => {
  localFilters.value.push({ fieldId: '', operator: '', value: '' });
};

const removeFilter = (index: number) => {
  localFilters.value.splice(index, 1);
};

const applyFilters = () => {
  // Filter out any incomplete conditions before emitting
  const validFilters = localFilters.value.filter(f => f.fieldId && f.operator);
  emit('apply', validFilters);
  close();
};

const close = () => {
  emit('close');
};
</script>

<style scoped>
/* Add your styles here */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1rem;
}

.filter-condition {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.filter-select, .filter-input {
  flex-grow: 1;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}

.add-filter-btn, .remove-filter-btn {
  border: none;
  background: none;
  cursor: pointer;
  padding: 0.5rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #1e293b;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>