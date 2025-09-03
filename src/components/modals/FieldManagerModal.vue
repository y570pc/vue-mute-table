<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>字段管理</h3>
        <button @click="$emit('close')" class="close-btn">
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="modal-body">
        <!-- 字段列表 -->
        <div class="field-list">
          <div class="field-list-header">
            <span class="header-text">字段列表</span>
            <button @click="showAddField = true" class="add-field-btn">
              <Plus class="w-4 h-4" />
              添加字段
            </button>
          </div>

          <div class="field-items">
            <div
                v-for="(field, index) in fields"
                :key="field.id"
                class="field-item"
                :class="{ editing: editingField?.id === field.id }"
                draggable="true"
                @dragstart="startFieldDrag($event, index)"
                @dragend="endFieldDrag"
                @dragover="handleFieldDragOver($event, index)"
                @drop="handleFieldDrop($event, index)"
            >
              <!-- 拖拽手柄 -->
              <div class="field-drag-handle">
                <GripVertical class="w-4 h-4" />
              </div>

              <!-- 字段信息 -->
              <div class="field-info">
                <div class="field-icon">
                  <component :is="getFieldIcon(field.type)" class="w-4 h-4" />
                </div>
                <div class="field-details">
                  <div class="field-name">{{ field.name }}</div>
                  <div class="field-meta">
                    <span class="field-type">{{ getFieldTypeName(field.type) }}</span>
                    <span class="field-width">宽度: {{ field.width }}px</span>
                    <span v-if="field.required" class="field-required">必填</span>
                  </div>
                </div>
              </div>

              <!-- 可见性切换 -->
              <div class="field-visibility">
                <label class="visibility-toggle">
                  <input
                      type="checkbox"
                      :checked="field.visible"
                      @change="toggleFieldVisibility(field.id, $event.target.checked)"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <!-- 操作按钮 -->
              <div class="field-actions">
                <button
                    class="action-btn edit"
                    @click="startEditField(field)"
                    :title="'编辑 ' + field.name"
                >
                  <Edit class="w-3 h-3" />
                </button>
                <button
                    class="action-btn delete"
                    @click="deleteField(field.id)"
                    :title="'删除 ' + field.name"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 添加/编辑字段表单 -->
        <div v-if="showAddField || editingField" class="field-form">
          <div class="form-header">
            <h4>{{ editingField ? '编辑字段' : '添加字段' }}</h4>
            <button @click="cancelFieldEdit" class="cancel-btn">
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="saveField" class="form-content">
            <div class="form-row">
              <div class="form-group">
                <label>字段名称</label>
                <input
                    v-model="fieldForm.name"
                    type="text"
                    class="form-input"
                    placeholder="请输入字段名称"
                    required
                />
              </div>

              <div class="form-group">
                <label>字段类型</label>
                <select v-model="fieldForm.type" class="form-select" required>
                  <option value="">请选择类型</option>
                  <option v-for="type in fieldTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>列宽度</label>
                <input
                    v-model.number="fieldForm.width"
                    type="number"
                    class="form-input"
                    placeholder="120"
                    min="80"
                    max="500"
                />
              </div>

              <div class="form-group">
                <label>默认值</label>
                <input
                    v-model="fieldForm.defaultValue"
                    type="text"
                    class="form-input"
                    placeholder="可选"
                />
              </div>
            </div>

            <!-- 选择类型的选项配置 -->
            <div v-if="fieldForm.type === 'select' || fieldForm.type === 'multiSelect'" class="form-group">
              <label>选项配置</label>
              <div class="options-config">
                <div
                    v-for="(option, index) in fieldForm.options"
                    :key="index"
                    class="option-item"
                >
                  <input
                      v-model="fieldForm.options[index]"
                      type="text"
                      class="option-input"
                      placeholder="选项名称"
                  />
                  <button
                      type="button"
                      @click="removeOption(index)"
                      class="remove-option-btn"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </div>
                <button
                    type="button"
                    @click="addOption"
                    class="add-option-btn"
                >
                  <Plus class="w-3 h-3" />
                  添加选项
                </button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input
                      v-model="fieldForm.visible"
                      type="checkbox"
                      class="form-checkbox"
                  />
                  <span>显示字段</span>
                </label>
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input
                      v-model="fieldForm.required"
                      type="checkbox"
                      class="form-checkbox"
                  />
                  <span>必填字段</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>字段描述</label>
              <textarea
                  v-model="fieldForm.description"
                  class="form-textarea"
                  placeholder="字段描述（可选）"
                  rows="3"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" @click="cancelFieldEdit" class="btn-secondary">
                取消
              </button>
              <button type="submit" class="btn-primary">
                {{ editingField ? '更新字段' : '添加字段' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { X, Plus, Edit, Trash2, GripVertical } from 'lucide-vue-next'
import { useTableStore } from '@/stores/table'
import { getFieldIcon, generateId } from '@/utils'
import type { Field } from '@/types'

const tableStore = useTableStore()

const showAddField = ref(false)
const editingField = ref<Field | null>(null)
const dragState = ref({
  isDragging: false,
  dragIndex: -1,
  dropTarget: -1
})

// 字段表单
const fieldForm = reactive({
  name: '',
  type: '',
  width: 120,
  visible: true,
  required: false,
  options: [] as string[],
  defaultValue: '',
  description: ''
})

// 字段类型选项
const fieldTypes = [
  { value: 'text', label: '文本' },
  { value: 'number', label: '数字' },
  { value: 'date', label: '日期' },
  { value: 'select', label: '单选' },
  { value: 'multiSelect', label: '多选' },
  { value: 'user', label: '用户' },
  { value: 'checkbox', label: '复选框' },
  { value: 'url', label: '链接' },
  { value: 'email', label: '邮箱' },
  { value: 'phone', label: '电话' }
]

const fields = computed(() => tableStore.fields || [])

const emit = defineEmits<{
  close: []
  fieldUpdated: []
}>()

// 字段类型名称映射
const getFieldTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    text: '文本',
    number: '数字',
    date: '日期',
    select: '单选',
    multiSelect: '多选',
    user: '用户',
    checkbox: '复选框',
    url: '链接',
    email: '邮箱',
    phone: '电话'
  }
  return typeMap[type] || '未知'
}

// 字段可见性切换
const toggleFieldVisibility = (fieldId: string, visible: boolean) => {
  tableStore.updateField(fieldId, { visible })
  emit('fieldUpdated')
}

// 开始编辑字段
const startEditField = (field: Field) => {
  editingField.value = field
  showAddField.value = false

  // 填充表单
  Object.assign(fieldForm, {
    name: field.name,
    type: field.type,
    width: field.width,
    visible: field.visible,
    required: field.required || false,
    options: field.options ? [...field.options] : [],
    defaultValue: field.defaultValue || '',
    description: field.description || ''
  })
}

// 取消编辑
const cancelFieldEdit = () => {
  editingField.value = null
  showAddField.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.assign(fieldForm, {
    name: '',
    type: '',
    width: 120,
    visible: true,
    required: false,
    options: [],
    defaultValue: '',
    description: ''
  })
}

// 保存字段
const saveField = () => {
  if (!fieldForm.name || !fieldForm.type) {
    alert('请填写字段名称和类型')
    return
  }

  const fieldData = {
    name: fieldForm.name,
    type: fieldForm.type,
    width: fieldForm.width,
    visible: fieldForm.visible,
    required: fieldForm.required,
    options: fieldForm.options.filter(option => option.trim()),
    defaultValue: fieldForm.defaultValue,
    description: fieldForm.description
  }

  if (editingField.value) {
    // 更新字段
    tableStore.updateField(editingField.value.id, fieldData)
  } else {
    // 添加字段
    tableStore.addField(fieldData)
  }

  emit('fieldUpdated')
  cancelFieldEdit()
}

// 删除字段
const deleteField = (fieldId: string) => {
  const field = fields.value.find(f => f.id === fieldId)
  if (!field) return

  if (confirm(`确定要删除字段"${field.name}"吗？删除后相关数据将丢失。`)) {
    tableStore.deleteField(fieldId)
    emit('fieldUpdated')
  }
}

// 选项管理
const addOption = () => {
  fieldForm.options.push('')
}

const removeOption = (index: number) => {
  fieldForm.options.splice(index, 1)
}

// 字段拖拽排序
const startFieldDrag = (event: DragEvent, index: number) => {
  dragState.value = {
    isDragging: true,
    dragIndex: index,
    dropTarget: -1
  }

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())
  }
}

const handleFieldDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  if (dragState.value.dragIndex !== index) {
    dragState.value.dropTarget = index
  }
}

const handleFieldDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault()

  if (dragState.value.dragIndex !== dropIndex) {
    tableStore.reorderFields(dragState.value.dragIndex, dropIndex)
    emit('fieldUpdated')
  }
}

const endFieldDrag = () => {
  dragState.value = {
    isDragging: false,
    dragIndex: -1,
    dropTarget: -1
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 800px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
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
  display: flex;
  gap: 20px;
}

.field-list {
  flex: 1;
}

.field-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.header-text {
  font-weight: 600;
  color: #374151;
}

.add-field-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.add-field-btn:hover {
  background: #2563eb;
}

.field-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
  transition: all 0.2s;
  cursor: move;
}

.field-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.field-item.editing {
  background: #eff6ff;
  border-color: #3b82f6;
}

.field-drag-handle {
  color: #9ca3af;
  cursor: move;
}

.field-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.field-icon {
  color: #6b7280;
}

.field-details {
  flex: 1;
}

.field-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.field-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.field-type {
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 4px;
}

.field-required {
  background: #fecaca;
  color: #dc2626;
  padding: 2px 6px;
  border-radius: 4px;
}

.field-visibility {
  display: flex;
  align-items: center;
}

.visibility-toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.visibility-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #3b82f6;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.field-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  padding: 6px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e5e7eb;
}

.action-btn.edit:hover {
  background: #dbeafe;
  color: #2563eb;
}

.action-btn.delete:hover {
  background: #fef2f2;
  color: #dc2626;
}

.field-form {
  flex: 1;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.form-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.cancel-btn {
  padding: 4px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.form-content {
  padding: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
  font-size: 14px;
}

.form-input,
.form-select,
.form-textarea {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.options-config {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.option-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
}

.remove-option-btn {
  padding: 4px;
  border: none;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 4px;
  cursor: pointer;
}

.add-option-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border: 1px dashed #d1d5db;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  font-size: 12px;
}

.add-option-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border-radius: 4px;
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
}

/* 移动端优化 */
@media (max-width: 768px) {
  .modal-content {
    width: 95vw;
    height: 90vh;
  }

  .modal-body {
    flex-direction: column;
    gap: 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .field-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
