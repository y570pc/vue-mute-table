<!-- components/FilterModal.vue -->
<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>高级筛选</h3>
        <button @click="$emit('close')" class="close-btn">
          <X class="w-4 h-4" />
        </button>
      </div>
      <div class="modal-body">
        <!-- 递归渲染根组 -->
        <FilterG
          v-if="localFilters"
          :group="localFilters"
          :fields="fields"
          @remove-group="handleRemoveRoot"
        />
        <button @click="addRule" class="add-filter-btn">+ 添加条件</button>
        <button @click="addGroup" class="add-filter-btn">+ 添加分组 (OR)</button>
      </div>
      <div class="modal-footer">
        <button @click="handleClose" class="btn-secondary">取消</button>
        <button @click="handleApply" class="btn-primary">应用</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import { generateId } from '@/utils';
import { X} from 'lucide-vue-next'
import type { Field, TopLevelFilter, FilterRule, FilterGroup } from '@/types';
import FilterG from './FilterGroup.vue'; // 递归子组件
import cloneDeep from 'lodash.clonedeep'

const props = defineProps<{
  show: boolean;
  fields: Field[];
  filters: TopLevelFilter; // 接收嵌套结构
}>();

const emit = defineEmits(['apply', 'close'])
const handleApply = () => {
  emit('apply', localFilters.value)
}

const handleClose = () => {
  emit('close')
}

const localFilters = ref<TopLevelFilter>({ id: 'root', logic: 'and', rules: [] });

// 操作符选项
const operators = [
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'contains', label: '包含' },
  { value: 'not_contains', label: '不包含' },
  { value: 'starts_with', label: '开头是' },
  { value: 'ends_with', label: '结尾是' },
  { value: 'is_empty', label: '为空' },
  { value: 'is_not_empty', label: '不为空' },
  { value: 'greater_than', label: '大于' },
  { value: 'less_than', label: '小于' },
  { value: 'greater_equal', label: '大于等于' },
  { value: 'less_equal', label: '小于等于' },
];

// ✅ 每次打开 Modal，从 props.filters 初始化 localFilters
watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      const raw = toRaw(props.filters)
      localFilters.value = cloneDeep(raw)
      console.log('✅ Modal opened, localFilters set to:', localFilters.value)
    }
  },
  { immediate: true }
)

// 添加单个规则
const addRule = () => {
  if (!localFilters.value.rules) localFilters.value.rules = [];
  localFilters.value.rules.push({
    id: generateId(),
    fieldId: '',
    operator: 'equals',
    value: '',
  });
};

// 添加一个 OR 分组
const addGroup = () => {
  if (!localFilters.value.rules) localFilters.value.rules = [];
  localFilters.value.rules.push({
    id: generateId(),
    logic: 'or',
    rules: [],
  });
};

// 根组被删（理论上不会发生，但保留）
const handleRemoveRoot = () => {
  localFilters.value.rules = [];
};

const applyFilters = () => {
  // 可以在这里过滤空规则
  cleanEmptyRules(localFilters.value);
  emit('apply', localFilters.value);
  close();
};

// 清理空规则（递归）
function cleanEmptyRules(group: FilterGroup) {
  group.rules = group.rules.filter((rule) => {
    if ('logic' in rule) {
      cleanEmptyRules(rule);
      return rule.rules.length > 0;
    }
    return rule.fieldId && rule.operator;
  });
}

const close = () => {
  emit('close');
};



</script>

<style scoped>
/* 保持原有样式 */
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
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  padding: 1rem;
}

.add-filter-btn {
  margin-top: 0.5rem;
  background: none;
  border: 1px dashed #94a3b8;
  color: #334155;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
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