<template>
  <div class="cell-renderer" :class="{ editing }">
    <!-- 文本类型 -->
    <template v-if="field.type === 'text'">
      <input
        v-if="editing"
        ref="inputRef"
        v-model="localValue"
        type="text"
        class="cell-input"
        @blur="finishEdit"
        @keydown.enter="finishEdit"
        @keydown.escape="cancelEdit"
      />
      <span v-else class="cell-text" :title="displayValue">
        {{ displayValue }}
      </span>
    </template>

    <!-- 数字类型 -->
    <template v-else-if="field.type === 'number'">
      <input
        v-if="editing"
        ref="inputRef"
        v-model.number="localValue"
        type="number"
        class="cell-input"
        @blur="finishEdit"
        @keydown.enter="finishEdit"
        @keydown.escape="cancelEdit"
      />
      <span v-else class="cell-text">
        {{ formatNumber(value) }}
      </span>
    </template>

    <!-- 日期类型 -->
    <template v-else-if="field.type === 'date'">
      <input
        v-if="editing"
        ref="inputRef"
        v-model="localValue"
        type="date"
        class="cell-input"
        @blur="finishEdit"
        @keydown.enter="finishEdit"
        @keydown.escape="cancelEdit"
      />
      <span v-else class="cell-text">
        {{ formatDate(value) }}
      </span>
    </template>

    <!-- 选择类型 -->
    <template v-else-if="field.type === 'select'">
      <select
        v-if="editing"
        ref="inputRef"
        v-model="localValue"
        class="cell-select"
        @blur="finishEdit"
        @keydown.enter="finishEdit"
        @keydown.escape="cancelEdit"
      >
        <option value="">请选择</option>
        <option v-for="option in field.options" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
      <div v-else class="cell-tag" :class="getTagClass(value)">
        {{ value || '-' }}
      </div>
    </template>

    <!-- 多选类型 -->
    <template v-else-if="field.type === 'multiSelect'">
      <div v-if="editing" class="multi-select-editor">
        <div v-for="option in field.options" :key="option" class="option-item">
          <input
            :id="`${field.id}-${option}`"
            type="checkbox"
            :value="option"
            :checked="localValue?.includes(option)"
            @change="toggleMultiSelectOption(option)"
          />
          <label :for="`${field.id}-${option}`">{{ option }}</label>
        </div>
      </div>
      <div v-else class="multi-select-display">
        <span
          v-for="item in (value || [])"
          :key="item"
          class="cell-tag small"
        >
          {{ item }}
        </span>
      </div>
    </template>

    <!-- 用户类型 -->
    <template v-else-if="field.type === 'user'">
      <input
        v-if="editing"
        ref="inputRef"
        v-model="localValue"
        type="text"
        class="cell-input"
        placeholder="输入用户名"
        @blur="finishEdit"
        @keydown.enter="finishEdit"
        @keydown.escape="cancelEdit"
      />
      <div v-else class="user-display">
        <div class="user-avatar">
          {{ getUserInitial(value) }}
        </div>
        <span class="user-name">{{ value || '-' }}</span>
      </div>
    </template>

    <!-- 复选框类型 -->
    <template v-else-if="field.type === 'checkbox'">
      <input
        type="checkbox"
        :checked="!!value"
        class="cell-checkbox"
        @change="handleCheckboxChange"
      />
    </template>

    <!-- URL类型 -->
    <template v-else-if="field.type === 'url'">
      <input
        v-if="editing"
        ref="inputRef"
        v-model="localValue"
        type="url"
        class="cell-input"
        placeholder="https://"
        @blur="finishEdit"
        @keydown.enter="finishEdit"
        @keydown.escape="cancelEdit"
      />
      <a
        v-else-if="value"
        :href="value"
        target="_blank"
        class="cell-link"
        @click.stop
      >
        {{ value }}
      </a>
      <span v-else class="cell-text">-</span>
    </template>

    <!-- 邮箱类型 -->
    <template v-else-if="field.type === 'email'">
      <input
        v-if="editing"
        ref="inputRef"
        v-model="localValue"
        type="email"
        class="cell-input"
        placeholder="example@email.com"
        @blur="finishEdit"
        @keydown.enter="finishEdit"
        @keydown.escape="cancelEdit"
      />
      <a
        v-else-if="value"
        :href="`mailto:${value}`"
        class="cell-link"
        @click.stop
      >
        {{ value }}
      </a>
      <span v-else class="cell-text">-</span>
    </template>

    <!-- 电话类型 -->
    <template v-else-if="field.type === 'phone'">
      <input
        v-if="editing"
        ref="inputRef"
        v-model="localValue"
        type="tel"
        class="cell-input"
        placeholder="手机号码"
        @blur="finishEdit"
        @keydown.enter="finishEdit"
        @keydown.escape="cancelEdit"
      />
      <a
        v-else-if="value"
        :href="`tel:${value}`"
        class="cell-link"
        @click.stop
      >
        {{ value }}
      </a>
      <span v-else class="cell-text">-</span>
    </template>

    <!-- 默认类型 -->
    <template v-else>
      <span class="cell-text">{{ displayValue }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import type { Field } from '@/types'
import { formatDate } from '@/utils'

interface Props {
  value: any
  field: Field
  editing: boolean
  rowHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  rowHeight: 48
})

const emit = defineEmits<{
  update: [value: any]
  finishEdit: []
}>()

const inputRef = ref<HTMLInputElement>()
const localValue = ref(props.value)
const originalValue = ref(props.value)

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) return '-'
  return String(props.value)
})

// 监听编辑状态变化
watch(() => props.editing, async (editing) => {
  if (editing) {
    localValue.value = props.value
    originalValue.value = props.value
    await nextTick()
    inputRef.value?.focus()
    inputRef.value?.select()
  }
})

// 监听值变化
watch(() => props.value, (newValue) => {
  if (!props.editing) {
    localValue.value = newValue
  }
})

const finishEdit = () => {
  if (localValue.value !== originalValue.value) {
    emit('update', localValue.value)
  }
  emit('finishEdit')
}

const cancelEdit = () => {
  localValue.value = originalValue.value
  emit('finishEdit')
}

const handleCheckboxChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update', target.checked)
}

const toggleMultiSelectOption = (option: string) => {
  const currentValue = localValue.value || []
  const index = currentValue.indexOf(option)
  
  if (index > -1) {
    currentValue.splice(index, 1)
  } else {
    currentValue.push(option)
  }
  
  localValue.value = [...currentValue]
}

const formatNumber = (value: any) => {
  if (value === null || value === undefined || value === '') return '-'
  return Number(value).toLocaleString()
}

const getUserInitial = (name: string) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

const getTagClass = (value: string) => {
  const classMap: Record<string, string> = {
    '进行中': 'tag-progress',
    '已完成': 'tag-completed',
    '待开始': 'tag-pending',
    '重要紧急': 'tag-urgent',
    '紧急不重要': 'tag-important',
    '重要不紧急': 'tag-normal'
  }
  return classMap[value] || 'tag-default'
}
</script>

<style scoped>
.cell-renderer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
}

.cell-input,
.cell-select {
  width: 100%;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 14px;
  outline: none;
  background: white;
}

.cell-input:focus,
.cell-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.cell-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.cell-link {
  color: #3b82f6;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-link:hover {
  text-decoration: underline;
}

.cell-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.cell-tag.small {
  padding: 2px 6px;
  font-size: 11px;
  margin-right: 4px;
}

.tag-progress {
  background: #fef3c7;
  color: #92400e;
}

.tag-completed {
  background: #d1fae5;
  color: #065f46;
}

.tag-pending {
  background: #fee2e2;
  color: #991b1b;
}

.tag-urgent {
  background: #fecaca;
  color: #dc2626;
}

.tag-important {
  background: #fed7aa;
  color: #ea580c;
}

.tag-normal {
  background: #dbeafe;
  color: #1d4ed8;
}

.tag-default {
  background: #f3f4f6;
  color: #374151;
}

.user-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.user-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.multi-select-editor {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
}

.option-item:hover {
  background: #f9fafb;
}

.option-item input {
  margin: 0;
}

.option-item label {
  cursor: pointer;
  flex: 1;
}

.multi-select-display {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

/* 性能优化 */
.cell-renderer {
  contain: layout style paint;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .cell-input,
  .cell-select {
    height: 28px;
    font-size: 12px;
  }
  
  .cell-text {
    font-size: 12px;
  }
  
  .user-avatar {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
}
</style>
