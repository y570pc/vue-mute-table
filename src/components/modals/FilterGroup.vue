<!-- components/FilterGroup.vue -->
<template>
  <div class="filter-group">
    <div class="group-header">
      <select v-model="group.logic" class="logic-select">
        <option value="and">所有条件满足 (AND)</option>
        <option value="or">任一条件满足 (OR)</option>
      </select>
      <button @click="removeSelf" class="remove-btn">×</button>
    </div>

    <div class="group-rules">
      <div
        v-for="(rule, index) in group.rules"
        :key="rule.id"
        class="rule-item"
      >
        <!-- 如果是规则 -->
        <template v-if="'fieldId' in rule">
          <select v-model="rule.fieldId" class="field-select">
            <option disabled value="">选择字段</option>
            <option
              v-for="field in fields"
              :key="field.id"
              :value="field.id"
            >
              {{ field.name }}
            </option>
          </select>
          <select v-model="rule.operator" class="operator-select">
            <option disabled value="">操作</option>
            <option
              v-for="op in operators"
              :key="op.value"
              :value="op.value"
            >
              {{ op.label }}
            </option>
          </select>
          <input
            v-if="!isEmptyOperator(rule.operator)"
            v-model="rule.value"
            type="text"
            class="value-input"
            placeholder="输入值"
          />
          <button @click="removeRule(index)" class="remove-rule-btn">−</button>
        </template>

        <!-- 如果是分组 -->
        <FilterGroup
          v-else
          :group="rule"
          :fields="fields"
          @remove-group="() => removeRule(index)"
        />
      </div>
    </div>

    <div class="group-actions">
      <button @click="addRule" class="add-rule-btn">+ 条件</button>
      <button @click="addGroup" class="add-group-btn">+ 分组</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import type { Field, FilterGroup, FilterRule } from '@/types';
import { generateId } from '@/utils';

defineOptions({
  name: 'FilterGroup',
});

const props = defineProps<{
  group: {
    id: string
    logic?: 'and' | 'or'
    rules: (FilterRule | FilterGroup)[]
  },
  fields: Field[];
}>()

const emit = defineEmits<{
  (e: 'remove-group'): void;
}>();

// ✅ 确保 rules 存在，如果没有就初始化为空数组
const rules = computed(() => props.group.rules ?? [])

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

const isEmptyOperator = (op: string) =>
  ['is_empty', 'is_not_empty'].includes(op);

const removeRule = (index: number) => {
  props.group.rules.splice(index, 1);
};

const removeSelf = () => {
  emit('remove-group');
};

const addRule = () => {
  props.group.rules.push({
    id: generateId(),
    fieldId: '',
    operator: 'equals',
    value: '',
  });
};

const addGroup = () => {
  props.group.rules.push({
    id: generateId(),
    logic: 'or',
    rules: [],
  });
};
</script>

<style scoped>
.filter-group {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.group-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.logic-select {
  padding: 0.4rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: white;
}

.remove-btn {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
}

.group-rules {
  margin-left: 1rem;
}

.rule-item {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  margin-bottom: 0.4rem;
  flex-wrap: wrap;
}

.field-select, .operator-select {
  padding: 0.4rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  min-width: 120px;
}

.value-input {
  flex-grow: 1;
  min-width: 100px;
  padding: 0.4rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}


.remove-rule-btn {
  background: #ef4444;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
}

.group-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.add-rule-btn, .add-group-btn {
  background: none;
  border: 1px dashed #94a3b8;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}
</style>