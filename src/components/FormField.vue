<template>
  <div class="form-field">
    <!-- 文本类型 -->
    <input
        v-if="field.type === 'text'"
        :value="value"
        @input="$emit('update', ($event.target as HTMLInputElement)?.value)"
        type="text"
        class="input"
        :placeholder="field.name"
    />

    <!-- 数字类型 -->
    <input
        v-else-if="field.type === 'number'"
        :value="value"
        @input="$emit('update', Number(($event.target as HTMLInputElement)?.value))"
        type="number"
        class="input"
        :placeholder="field.name"
    />

    <!-- 日期类型 -->
    <input
        v-else-if="field.type === 'date'"
        :value="value"
        @input="$emit('update', ($event.target as HTMLInputElement)?.value)"
        type="date"
        class="input"
    />

    <!-- 选择类型 -->
    <select
        v-else-if="field.type === 'select'"
        :value="value"
        @change="$emit('update', ($event.target as HTMLSelectElement)?.value)"
        class="input"
    >
      <option value="">请选择</option>
      <option v-for="option in field.options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>

    <!-- 复选框类型 -->
    <input
        v-else-if="field.type === 'checkbox'"
        :checked="!!value"
        @change="$emit('update', ($event.target as HTMLInputElement)?.checked)"
        type="checkbox"
        class="checkbox"
    />

    <!-- 默认文本输入 -->
    <input
        v-else
        :value="value"
        @input="$emit('update', ($event.target as HTMLInputElement)?.value)"
        type="text"
        class="input"
        :placeholder="field.name"
    />
  </div>
</template>

<script setup lang="ts">
import type { Field } from '@/types'

interface Props {
  field: Field
  value: any
}

defineProps<Props>()

defineEmits<{
  update: [value: any]
}>()
</script>

<style scoped>
.form-field {
  width: 100%;
}

.input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
</style>
