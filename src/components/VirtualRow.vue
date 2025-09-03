<template>
  <div 
    class="virtual-row"
    :class="{ selected, 'is-dragging': isDragging }"
    :style="{ 
      height: rowHeight + 'px',
      transform: `translateY(${index * rowHeight}px)`
    }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <div class="row-cell checkbox-cell">
      <input 
        type="checkbox" 
        :checked="selected"
        @change="$emit('select', record.id)"
      />
    </div>
    
    <div 
      v-for="(field, fieldIndex) in fields"
      :key="field.id"
      class="row-cell"
      :style="{ 
        width: field.width + 'px',
        left: getColumnLeft(fieldIndex) + 'px'
      }"
      @click="handleCellClick(field.id)"
      @dblclick="handleCellDoubleClick(field.id)"
    >
      <CellRenderer 
        :value="record[field.id]"
        :field="field"
        :editing="isEditing(field.id)"
        :row-height="rowHeight"
        @update="handleCellUpdate(field.id, $event)"
        @finish-edit="$emit('finish-edit')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CellRenderer from './CellRenderer.vue'
import type { Field, Record } from '@/types'

interface Props {
  record: Record
  fields: Field[]
  index: number
  selected: boolean
  editingCell: { recordId: string; fieldId: string } | null
  scrollLeft: number
  rowHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  rowHeight: 48
})

const emit = defineEmits<{
  select: [recordId: string]
  editCell: [recordId: string, fieldId: string]
  updateCell: [recordId: string, fieldId: string, value: any]
  finishEdit: []
  dragStart: [event: DragEvent, record: Record, index: number]
}>()

const isDragging = ref(false)

const getColumnLeft = (index: number) => {
  let left = 48 // checkbox width
  for (let i = 0; i < index; i++) {
    left += props.fields[i].width
  }
  return left
}

const isEditing = (fieldId: string) => {
  return props.editingCell?.recordId === props.record.id && props.editingCell?.fieldId === fieldId
}

const handleCellClick = (fieldId: string) => {
  emit('editCell', props.record.id, fieldId)
}

const handleCellDoubleClick = (fieldId: string) => {
  emit('editCell', props.record.id, fieldId)
}

const handleCellUpdate = (fieldId: string, value: any) => {
  emit('updateCell', props.record.id, fieldId, value)
}

const handleDragStart = (event: DragEvent) => {
  isDragging.value = true
  emit('dragStart', event, props.record, props.index)
}

const handleDragEnd = () => {
  isDragging.value = false
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  // 处理拖拽放置逻辑
}
</script>

<style scoped>
.virtual-row {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  border-bottom: 1px solid #f1f5f9;
  background: white;
  cursor: pointer;
  transition: background-color 0.1s;
}

.virtual-row:hover {
  background: #f8fafc;
}

.virtual-row.selected {
  background: #eff6ff;
}

.virtual-row.is-dragging {
  opacity: 0.5;
  z-index: 1000;
}

.row-cell {
  position: absolute;
  top: 0;
  bottom: 0;
  border-right: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 14px;
  color: #374151;
  overflow: hidden;
}

.checkbox-cell {
  width: 48px;
  left: 0;
  justify-content: center;
  padding: 0;
}

/* 性能优化 */
.virtual-row {
  contain: layout style paint;
  will-change: transform;
}

.row-cell {
  contain: layout style paint;
}
</style>
