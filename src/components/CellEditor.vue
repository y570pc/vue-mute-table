<template>
  <div class="cell-editor" @click.stop>
    <!-- 文本类型 -->
    <input
        v-if="field.type === 'text'"
        ref="inputRef"
        v-model="localValue"
        type="text"
        class="cell-input"
        @blur="handleBlur"
        @keydown.enter="finish"
        @keydown.escape="cancel"
        @keydown.tab="finish"
    />

    <!-- 数字类型 -->
    <input
        v-else-if="field.type === 'number'"
        ref="inputRef"
        v-model.number="localValue"
        type="number"
        class="cell-input"
        @blur="handleBlur"
        @keydown.enter="finish"
        @keydown.escape="cancel"
        @keydown.tab="finish"
    />

    <!-- 日期类型 -->
    <input
        v-else-if="field.type === 'date'"
        ref="inputRef"
        v-model="localValue"
        type="date"
        class="cell-input"
        @blur="handleBlur"
        @keydown.enter="finish"
        @keydown.escape="cancel"
        @keydown.tab="finish"
    />

    <!-- 选择类型 -->
    <select
        v-else-if="field.type === 'select'"
        ref="inputRef"
        v-model="localValue"
        class="cell-select"
        @blur="handleBlur"
        @keydown.enter="finish"
        @keydown.escape="cancel"
        @keydown.tab="finish"
    >
      <option value="">请选择</option>
      <option v-for="option in field.options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>

    <!-- 多选类型 -->
    <div v-else-if="field.type === 'multiSelect'" class="multi-select-editor">
      <div class="multi-select-dropdown" ref="dropdownRef">
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
    </div>

    <!-- 复选框类型 -->
    <div v-else-if="field.type === 'checkbox'" class="checkbox-editor">
      <input
          ref="inputRef"
          v-model="localValue"
          type="checkbox"
          class="cell-checkbox"
          @blur="handleBlur"
          @keydown.enter="finish"
          @keydown.escape="cancel"
          @keydown.tab="finish"
      />
    </div>

    <!-- URL类型 -->
    <input
        v-else-if="field.type === 'url'"
        ref="inputRef"
        v-model="localValue"
        type="url"
        class="cell-input"
        placeholder="https://"
        @blur="handleBlur"
        @keydown.enter="finish"
        @keydown.escape="cancel"
        @keydown.tab="finish"
    />

    <!-- 邮箱类型 -->
    <input
        v-else-if="field.type === 'email'"
        ref="inputRef"
        v-model="localValue"
        type="email"
        class="cell-input"
        placeholder="example@email.com"
        @blur="handleBlur"
        @keydown.enter="finish"
        @keydown.escape="cancel"
        @keydown.tab="finish"
    />

    <!-- 电话类型 -->
    <input
        v-else-if="field.type === 'phone'"
        ref="inputRef"
        v-model="localValue"
        type="tel"
        class="cell-input"
        placeholder="手机号码"
        @blur="handleBlur"
        @keydown.enter="finish"
        @keydown.escape="cancel"
        @keydown.tab="finish"
    />

    <!-- 用户类型 -->
    <input
        v-else-if="field.type === 'user'"
        ref="inputRef"
        v-model="localValue"
        type="text"
        class="cell-input"
        placeholder="输入用户名"
        @blur="handleBlur"
        @keydown.enter="finish"
        @keydown.escape="cancel"
        @keydown.tab="finish"
    />

    <!-- 默认文本输入 -->
    <input
        v-else
        ref="inputRef"
        v-model="localValue"
        type="text"
        class="cell-input"
        @blur="handleBlur"
        @keydown.enter="finish"
        @keydown.escape="cancel"
        @keydown.tab="finish"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import type { Field } from '@/types'

interface Props {
  value: any
  field: Field
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [value: any]
  finish: []
  cancel: []
}>()

const inputRef = ref<HTMLInputElement>()
const dropdownRef = ref<HTMLElement>()
const localValue = ref(props.value)
const originalValue = ref(props.value)
const isFinishing = ref(false)

onMounted(async () => {
  // 初始化多选值
  if (props.field.type === 'multiSelect' && !Array.isArray(localValue.value)) {
    localValue.value = localValue.value ? [localValue.value] : []
  }

  await nextTick()

  // 聚焦输入框
  if (inputRef.value) {
    inputRef.value.focus()

    // 选择文本内容
    if (inputRef.value.type === 'text' || inputRef.value.type === 'url' || inputRef.value.type === 'email') {
      inputRef.value.select()
    }
  }

  // 添加全局点击监听器
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})

const handleOutsideClick = (event: Event) => {
  const target = event.target as HTMLElement
  const editor = target.closest('.cell-editor')

  if (!editor && !isFinishing.value) {
    finish()
  }
}

const finish = () => {
  if (isFinishing.value) return

  isFinishing.value = true

  if (localValue.value !== originalValue.value) {
    emit('update', localValue.value)
  } else {
    emit('finish')
  }
}

const cancel = () => {
  if (isFinishing.value) return

  isFinishing.value = true
  localValue.value = originalValue.value
  emit('cancel')
}

const handleBlur = () => {
  // 延迟一点时间，避免点击下拉选项时立即关闭
  setTimeout(() => {
    if (!isFinishing.value) {
      finish()
    }
  }, 150)
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
</script>

<style scoped>
.cell-editor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: white;
}

.cell-input,
.cell-select {
  width: 100%;
  height: 100%;
  border: 2px solid #3b82f6;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 14px;
  outline: none;
  background: white;
  box-shadow: 0 0 0 1px #3b82f6;
}

.cell-input:focus,
.cell-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.checkbox-editor {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 4px;
}

.cell-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.multi-select-editor {
  position: relative;
  width: 100%;
  height: 100%;
}

.multi-select-dropdown {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #3b82f6;
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
  transition: background-color 0.2s;
}

.option-item:hover {
  background: #f9fafb;
}

.option-item input {
  margin: 0;
  cursor: pointer;
}

.option-item label {
  cursor: pointer;
  flex: 1;
  font-size: 14px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .cell-input,
  .cell-select {
    font-size: 16px; /* 防止iOS缩放 */
  }

  .multi-select-dropdown {
    max-height: 150px;
  }

  .option-item {
    padding: 12px;
  }
}
</style>
