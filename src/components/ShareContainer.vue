<template>
  <div class="table-container">
    <!-- 数据统计 -->
    <div class="table-stats">
      <span class="stats-item">
        总计 {{ totalRecords }} 条记录
      </span>
      <span class="stats-item">
        已选择 {{ selectedRecords?.length || 0 }} 条
      </span>
    </div>

    <!-- 优化后的表格 - 修复滚动同步问题 -->
    <div class="table-wrapper" v-if="!isLoading">
      <!-- 表格头部 - 独立容器 -->
      <div class="table-header-wrapper">
        <div
            class="table-header-scroll"
            ref="headerScrollRef"
            @scroll="handleHeaderScroll"
        >
          <div class="table-header" :style="{ width: totalTableWidth + 'px' }">
            <!-- 复选框列 -->
            <div class="header-cell checkbox-cell">
              <input
                  type="checkbox"
                  :checked="allSelected"
                  @change="toggleSelectAll"
              />
            </div>

            <!-- 字段列 -->
            <div
                v-for="(field, index) in tableStore.fields"
                :key="`header-${field.id}`"
                class="header-cell"
                :class="{
                'dragging': dragState.isDragging && dragState.dragIndex === index && dragState.dragType === 'column',
                'drop-target': dragState.dropTarget === index && dragState.dragType === 'column',
                'resizing': resizeState.isResizing && resizeState.columnIndex === index
              }"
                :style="getColumnStyle(field)"
                :draggable="!resizeState.isResizing"
                @dragstart="startColumnDrag($event, index)"
                @dragend="endColumnDrag"
                @dragover="handleColumnDragOver($event, index)"
                @drop="handleColumnDrop($event, index)"
            >
              <div class="header-content" @mousedown="handleHeaderMouseDown">
                <div
                    class="drag-handle"
                    @mousedown.stop="handleDragHandleMouseDown($event, index)"
                >
                  <GripVertical class="w-4 h-4" />
                </div>
                <span class="field-name" :title="field.tooltip">{{ field.name }}</span>
              </div>


            </div>
          </div>
        </div>
      </div>

      <!-- 表格主体 -->
      <div
          class="table-body-wrapper"
          ref="bodyScrollRef"
          @scroll="handleBodyScroll"
      >
        <div class="table-body" :style="{ width: totalTableWidth + 'px' }">
          <div
              v-for="(record, rowIndex) in displayRecords"
              :key="`row-${record.id}`"
              class="table-row"
              :class="{
              selected: selectedRecords.includes(record.id),
              'dragging': dragState.isDragging && dragState.dragType === 'row' && dragState.dragIndex === rowIndex,
              'drop-target': dragState.dropTarget === rowIndex && dragState.dragType === 'row'
            }"
              :draggable="!editingCell && !resizeState.isResizing"
              @dragstart="startRowDrag($event, rowIndex)"
              @dragend="endRowDrag"
              @dragover="handleRowDragOver($event, rowIndex)"
              @drop="handleRowDrop($event, rowIndex)"
          >
            <!-- 复选框列 -->
            <div class="row-cell checkbox-cell">
              <input
                  type="checkbox"
                  :checked="selectedRecords.includes(record.id)"
                  @change="toggleRecordSelection(record.id)"
              />
            </div>

            <!-- 行拖拽手柄 -->
            <div class="row-drag-handle" @mousedown.stop>
              <GripVertical class="w-4 h-4" />
            </div>

            <!-- 数据列 -->
            <div
                v-for="(field, fieldIndex) in tableStore.fields"
                :key="`cell-${record.id}-${field.id}`"
                class="row-cell"
                :style="getColumnStyle(field)"
                @click="handleCellClick(record.id, field.id)"
                @dblclick="startEditCell(record.id, field.id)"
            >
              <!-- 编辑模式 -->


              <!-- 显示模式 -->
              <CellDisplay
                  :value="record[field.id]"
                  :field="field"
                  :editing="false"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 拖拽指示器 -->
    <div
        v-if="dragState.isDragging"
        class="drag-indicator"
        :style="dragIndicatorStyle"
    >
      <div v-if="dragState.dragType === 'column'" class="column-indicator">
        <component :is="getFieldIcon(dragState.dragData?.type)" class="w-4 h-4" />
        <span>{{ dragState.dragData?.name }}</span>
      </div>
      <div v-else class="row-indicator">
        <span>{{ dragState.dragData?.title || '记录' }}</span>
      </div>
    </div>

    <!-- 字段管理模态框 -->
    <FieldManagerModal
        v-if="showFieldManagerModal"
        @close="showFieldManagerModal = false"
        @field-updated="handleFieldUpdated"
    />

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <Loader2 class="w-6 h-6 animate-spin" />
        <span>加载中...</span>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { Trash2, RefreshCw, Loader2, Database, GripVertical, ChevronDown } from 'lucide-vue-next'
import { useTableStore } from '@/stores/table'
import { getFieldIcon } from '@/utils'
import CellEditor from './CellEditor.vue'
import CellDisplay from './CellDisplay.vue'
import FieldManagerModal from './modals/FieldManagerModal.vue'

const tableStore = useTableStore()
const isLoading = ref(false)
const headerScrollRef = ref<HTMLElement>()
const bodyScrollRef = ref<HTMLElement>()
const showFieldManagerModal = ref(false)

// 滚动同步状态
const isHeaderScrolling = ref(false)
const isBodyScrolling = ref(false)

// 拖拽状态
const dragState = ref({
  isDragging: false,
  dragType: null as 'column' | 'row' | null,
  dragIndex: -1,
  dragData: null as any,
  dropTarget: -1,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0
})

// 列宽调整状态
const resizeState = ref({
  isResizing: false,
  columnIndex: -1,
  startX: 0,
  startWidth: 0
})

// 编辑状态
const editingCell = ref<{ recordId: string; fieldId: string } | null>(null)

// 安全地获取 store 数据
const selectedRecords = computed(() => tableStore.selectedRecords || [])



// 安全地访问 store 方法
const toggleRecordSelection = tableStore.toggleRecordSelection || (() => {})
const clearSelection = tableStore.clearSelection || (() => {})
const selectAllRecords = tableStore.selectAllRecords || (() => {})
const reorderFields = tableStore.reorderFields || (() => {})
const reorderRecords = tableStore.reorderRecords || (() => {})

const totalRecords = computed(() => (tableStore.records || []).length)
const allSelected = computed(() => {
  const selected = selectedRecords.value
  return  selected.length === totalRecords.value
})



// 限制显示的记录数量以提高性能
const displayRecords = computed(() => {
  const records = tableStore.records
  return records ? records.slice(0, 100) : []
})

// 计算表格总宽度
const totalTableWidth = computed(() => {
  const fieldsWidth = tableStore.fields.reduce((total, field) => total + field.width, 0)
  return fieldsWidth + 48 // 48px for checkbox column
})

// 获取列样式 - 确保表头和内容宽度一致
const getColumnStyle = (field: any) => {
  return {
    width: `${field.width}px`,
    minWidth: `${field.width}px`,
    maxWidth: `${field.width}px`,
    flexShrink: 0
  }
}

// 拖拽指示器样式
const dragIndicatorStyle = computed(() => ({
  left: dragState.value.currentX + 'px',
  top: dragState.value.currentY + 'px',
  transform: 'translate(-50%, -50%)'
}))

// 滚动同步处理 - 修复滚动不同频问题
const handleHeaderScroll = (event: Event) => {
  if (isBodyScrolling.value) return

  isHeaderScrolling.value = true
  const target = event.target as HTMLElement

  if (bodyScrollRef.value) {
    bodyScrollRef.value.scrollLeft = target.scrollLeft
  }

  // 使用 requestAnimationFrame 确保同步完成后再重置标志
  requestAnimationFrame(() => {
    isHeaderScrolling.value = false
  })
}

const handleBodyScroll = (event: Event) => {
  if (isHeaderScrolling.value) return

  isBodyScrolling.value = true
  const target = event.target as HTMLElement

  if (headerScrollRef.value) {
    headerScrollRef.value.scrollLeft = target.scrollLeft
  }

  // 使用 requestAnimationFrame 确保同步完成后再重置标志
  requestAnimationFrame(() => {
    isBodyScrolling.value = false
  })
}

// 优化拖拽冲突处理
const handleHeaderMouseDown = (event: MouseEvent) => {
  // 如果正在调整列宽，阻止拖拽
  if (resizeState.value.isResizing) {
    event.preventDefault()
    event.stopPropagation()
  }
}

const handleDragHandleMouseDown = (event: MouseEvent, index: number) => {
  // 确保只有拖拽手柄才能触发拖拽
  if (resizeState.value.isResizing) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
}

// 列拖拽功能 - 优化版本
const startColumnDrag = (event: DragEvent, index: number) => {
  if (resizeState.value.isResizing) {
    event.preventDefault()
    return
  }

  const field = tableStore.fields[index]
  if (!field) return

  dragState.value = {
    isDragging: true,
    dragType: 'column',
    dragIndex: index,
    dragData: field,
    dropTarget: -1,
    startX: event.clientX,
    startY: event.clientY,
    currentX: event.clientX,
    currentY: event.clientY
  }

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())

    // 创建透明的拖拽图像
    const dragImage = document.createElement('div')
    dragImage.style.opacity = '0'
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    document.body.appendChild(dragImage)
    event.dataTransfer.setDragImage(dragImage, 0, 0)
    setTimeout(() => document.body.removeChild(dragImage), 0)
  }

  document.addEventListener('dragover', updateDragPosition)
  document.body.classList.add('dragging-column')
}

const handleColumnDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  if (dragState.value.dragType === 'column' && dragState.value.dragIndex !== index) {
    dragState.value.dropTarget = index
  }
}

const handleColumnDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault()

  if (dragState.value.dragType === 'column' && dragState.value.dragIndex !== dropIndex) {
    const dragIndex = dragState.value.dragIndex
    reorderFields(dragIndex, dropIndex)
  }
}

const endColumnDrag = () => {
  dragState.value = {
    isDragging: false,
    dragType: null,
    dragIndex: -1,
    dragData: null,
    dropTarget: -1,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  }

  document.removeEventListener('dragover', updateDragPosition)
  document.body.classList.remove('dragging-column')
}

// 行拖拽功能
const startRowDrag = (event: DragEvent, index: number) => {
  if (editingCell.value || resizeState.value.isResizing) {
    event.preventDefault()
    return
  }

  const record = displayRecords.value[index]
  if (!record) return

  dragState.value = {
    isDragging: true,
    dragType: 'row',
    dragIndex: index,
    dragData: record,
    dropTarget: -1,
    startX: event.clientX,
    startY: event.clientY,
    currentX: event.clientX,
    currentY: event.clientY
  }

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())

    const dragImage = document.createElement('div')
    dragImage.style.opacity = '0'
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    document.body.appendChild(dragImage)
    event.dataTransfer.setDragImage(dragImage, 0, 0)
    setTimeout(() => document.body.removeChild(dragImage), 0)
  }

  document.addEventListener('dragover', updateDragPosition)
  document.body.classList.add('dragging-row')
}

const handleRowDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  if (dragState.value.dragType === 'row' && dragState.value.dragIndex !== index) {
    dragState.value.dropTarget = index
  }
}

const handleRowDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault()

  if (dragState.value.dragType === 'row' && dragState.value.dragIndex !== dropIndex) {
    const dragIndex = dragState.value.dragIndex
    reorderRecords(dragIndex, dropIndex)
  }
}

const endRowDrag = () => {
  dragState.value = {
    isDragging: false,
    dragType: null,
    dragIndex: -1,
    dragData: null,
    dropTarget: -1,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  }

  document.removeEventListener('dragover', updateDragPosition)
  document.body.classList.remove('dragging-row')
}

const endColumnResize = () => {
  resizeState.value = {
    isResizing: false,
    columnIndex: -1,
    startX: 0,
    startWidth: 0
  }

  document.removeEventListener('mouseup', endColumnResize)
  document.body.classList.remove('resizing-column')
  document.body.style.userSelect = ''
}

// 拖拽位置更新
const updateDragPosition = (event: DragEvent) => {
  dragState.value.currentX = event.clientX
  dragState.value.currentY = event.clientY
}

// 单元格编辑功能
const handleCellClick = (recordId: string, fieldId: string) => {
  // 单击选中，不进入编辑模式
}

const startEditCell = (recordId: string, fieldId: string) => {
  editingCell.value = { recordId, fieldId }
}

const finishEditCell = () => {
  editingCell.value = null
}

const cancelEditCell = () => {
  editingCell.value = null
}



// 字段管理
const showFieldMenu = (event: MouseEvent, field: any) => {
  showFieldManagerModal.value = true
}

const handleFieldUpdated = () => {
  // 字段更新后的处理
  nextTick(() => {
    // 重新计算表格宽度等
  })
}

// 其他功能
const toggleSelectAll = () => {
  if (allSelected.value) {
    clearSelection()
  } else {
    selectAllRecords()
  }
}




// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener('dragover', updateDragPosition)
  document.removeEventListener('mouseup', endColumnResize)
  document.body.classList.remove('dragging-column', 'dragging-row', 'resizing-column')
  document.body.style.userSelect = ''
})
</script>

<style scoped>
.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  position: relative;
  overflow: hidden;
}

.table-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  flex-shrink: 0;
}

.stats-item {
  color: #64748b;
  margin-right: 16px;
}

.stats-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #374151;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f9fafb;
}

.action-btn.danger {
  color: #dc2626;
  border-color: #fecaca;
}

.action-btn.danger:hover {
  background: #fef2f2;
}

.table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 表头容器 - 独立滚动 */
.table-header-wrapper {
  flex-shrink: 0;
  border-bottom: 2px solid #e2e8f0;
  background: white;
}

.table-header-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.table-header-scroll::-webkit-scrollbar {
  display: none;
}

.table-header {
  display: flex;
  background: #f8fafc;
  min-height: 44px;
}

.header-cell {
  border-right: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  color: #374151;
  position: relative;
  cursor: move;
  transition: all 0.2s;
  background: #f8fafc;
}

.header-cell:hover {
  background: #f1f5f9;
}

.header-cell.dragging {
  opacity: 0.5;
  background: #dbeafe;
  z-index: 1000;
}

.header-cell.drop-target {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.header-cell.resizing {
  background: #f1f5f9;
}

.checkbox-cell {
  width: 48px;
  min-width: 48px;
  max-width: 48px;
  justify-content: center;
  cursor: default;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  flex: 1;
  min-width: 0;
  height: 100%;
}

.drag-handle {
  color: #9ca3af;
  cursor: move;
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.header-cell:hover .drag-handle {
  opacity: 1;
}

.field-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}


.header-cell:hover {
  opacity: 1;
}



.resize-handle {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;
  z-index: 10;
}

.resize-handle:hover {
  background: #3b82f6;
}

/* 表格主体容器 - 独立滚动 */
.table-body-wrapper {
  flex: 1;
  overflow: auto;
}

.table-body {
  min-height: 100%;
  background: white;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #f1f5f9;
  min-height: 48px;
  transition: all 0.2s;
  position: relative;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row.selected {
  background: #eff6ff;
}

.table-row.dragging {
  opacity: 0.5;
  background: #dbeafe;
  z-index: 1000;
}

.table-row.drop-target {
  background: #eff6ff;
  border-top: 3px solid #3b82f6;
}

.row-drag-handle {
  position: absolute;
  left: 52px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  cursor: move;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 5;
  padding: 4px;
}

.table-row:hover .row-drag-handle {
  opacity: 1;
}

.row-cell {
  border-right: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 14px;
  color: #374151;
  position: relative;
  overflow: hidden;
}

.drag-indicator {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
  opacity: 0.9;
}

.column-indicator,
.row-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #64748b;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 16px 0 8px;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 24px;
  max-width: 400px;
  line-height: 1.5;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

/* 全局拖拽状态样式 */
:global(body.dragging-column) {
  cursor: move !important;
}

:global(body.dragging-row) {
  cursor: move !important;
}

:global(body.resizing-column) {
  cursor: col-resize !important;
  user-select: none !important;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .drag-handle,
  .row-drag-handle {
    opacity: 1;
  }

  .resize-handle {
    width: 8px;
    right: -4px;
  }

  .header-cell {
    min-width: 120px;
  }

  .table-stats {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .stats-actions {
    justify-content: center;
  }
}
</style>
