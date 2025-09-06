<template>
  <div class="virtual-table" ref="containerRef">
    <!-- 表格头部 -->
    <div class="table-header" ref="headerRef" :style="{ transform: `translateX(-${scrollLeft}px)` }">
      <div class="header-cell checkbox-cell">
        <input 
          type="checkbox" 
          :checked="allSelected"
          @change="toggleSelectAll"
        />
      </div>
      <div 
        v-for="(field, index) in visibleFields" 
        :key="field.id"
        class="header-cell"
        :style="{ 
          width: field.width + 'px',
          left: getColumnLeft(index) + 'px'
        }"
        @mousedown="startColumnResize($event, index)"
      >
        <div class="header-content" draggable="true" @dragstart="startColumnDrag($event, index)">
          <component :is="getFieldIcon(field.type)" class="w-4 h-4" />
          <span>{{ field.name }}</span>
        </div>
        <div class="resize-handle"></div>
      </div>
    </div>

    <!-- 虚拟滚动容器 -->
    <div 
      class="table-body" 
      ref="scrollContainerRef"
      @scroll="handleScroll"
      :style="{ height: containerHeight + 'px' }"
    >
      <!-- 虚拟占位符 - 上方 -->
      <div :style="{ height: offsetY + 'px' }"></div>
      
      <!-- 可见行渲染区域 -->
      <div class="visible-rows">
        <!-- 分组渲染 -->
        <template v-if="groupedRecords.length > 0">
          <div 
            v-for="(group, groupIndex) in visibleGroups" 
            :key="group.key"
            class="group-section"
            :style="{ transform: `translateY(${group.offsetY}px)` }"
          >
            <div class="group-header" @click="toggleGroup(group.key)">
              <ChevronRight 
                class="w-4 h-4 transition-transform"
                :class="{ 'rotate-90': group.expanded }"
              />
              <div class="group-badge" :style="{ backgroundColor: group.color }">
                {{ group.label }}
              </div>
              <span class="group-count">{{ group.records.length }} 条记录</span>
            </div>
            
            <div v-if="group.expanded" class="group-content">
              <VirtualRow
                v-for="(record, recordIndex) in group.visibleRecords"
                :key="record.id"
                :record="record"
                :fields="visibleFields"
                :index="recordIndex"
                :selected="selectedRecords.includes(record.id)"
                :editing-cell="editingCell"
                :scroll-left="scrollLeft"
                @select="toggleRecordSelection"
                @edit-cell="startEditCell"
                @update-cell="updateCell"
                @finish-edit="finishEditCell"
                @drag-start="startRowDrag"
              />
            </div>
          </div>
        </template>

        <!-- 无分组渲染 -->
        <template v-else>
          <VirtualRow
            v-for="(record, index) in visibleRecords"
            :key="record.id"
            :record="record"
            :fields="visibleFields"
            :index="startIndex + index"
            :selected="selectedRecords.includes(record.id)"
            :editing-cell="editingCell"
            :scroll-left="scrollLeft"
            @select="toggleRecordSelection"
            @edit-cell="startEditCell"
            @update-cell="updateCell"
            @finish-edit="finishEditCell"
            @drag-start="startRowDrag"
          />
        </template>
      </div>
      
      <!-- 虚拟占位符 - 下方 -->
      <div :style="{ height: (totalHeight - offsetY - visibleHeight) + 'px' }"></div>
    </div>

    <!-- 滚动条 -->
    <div class="scrollbar-track horizontal" v-if="showHorizontalScrollbar">
      <div 
        class="scrollbar-thumb"
        :style="{
          width: horizontalThumbWidth + 'px',
          left: horizontalThumbLeft + 'px'
        }"
        @mousedown="startHorizontalDrag"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { useTableStore } from '@/stores/table'
import { getFieldIcon } from '@/utils'
import VirtualRow from './VirtualRow.vue'
import type {  Record, GroupData } from '@/types'

// Props
interface Props {
  containerHeight?: number
  rowHeight?: number
  overscan?: number
  groupHeaderHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  containerHeight: 600,
  rowHeight: 48,
  overscan: 5,
  groupHeaderHeight: 40
})

// Store
const tableStore = useTableStore()

// Refs
const containerRef = ref<HTMLElement>()
const headerRef = ref<HTMLElement>()
const scrollContainerRef = ref<HTMLElement>()

// 滚动状态
const scrollTop = ref(0)
const scrollLeft = ref(0)
const isScrolling = ref(false)

// 虚拟滚动计算
const startIndex = computed(() => {
  return Math.max(0, Math.floor(scrollTop.value / props.rowHeight) - props.overscan)
})

const endIndex = computed(() => {
  const visibleCount = Math.ceil(props.containerHeight / props.rowHeight)
  return Math.min(
    filteredRecords.length - 1,
    startIndex.value + visibleCount + props.overscan * 2
  )
})

const visibleRecords = computed(() => {
  if (groupedRecords.length > 0) return []
  return filteredRecords.slice(startIndex.value, endIndex.value + 1)
})

const offsetY = computed(() => startIndex.value * props.rowHeight)
const totalHeight = computed(() => {
  if (groupedRecords.length > 0) {
    return groupedRecords.reduce((total: number, group: GroupData) => {
      return total + props.groupHeaderHeight + (group.expanded ? group.records.length * props.rowHeight : 0)
    }, 0)
  }
  return filteredRecords.length * props.rowHeight
})

const visibleHeight = computed(() => {
  return Math.min(props.containerHeight, (endIndex.value - startIndex.value + 1) * props.rowHeight)
})

// 分组虚拟滚动
const visibleGroups = computed(() => {
  if (groupedRecords.length === 0) return []
  
  const groups = []
  let currentY = 0
  const viewportTop = scrollTop.value
  const viewportBottom = scrollTop.value + props.containerHeight
  
  for (const group of groupedRecords) {
    const groupHeight = props.groupHeaderHeight + (group.expanded ? group.records.length * props.rowHeight : 0)
    
    // 检查分组是否在可视区域内
    if (currentY + groupHeight >= viewportTop && currentY <= viewportBottom) {
      const visibleGroup = {
        ...group,
        offsetY: currentY,
        visibleRecords: group.expanded ? getVisibleRecordsInGroup(group, currentY + props.groupHeaderHeight) : []
      }
      groups.push(visibleGroup)
    }
    
    currentY += groupHeight
  }
  
  return groups
})

const getVisibleRecordsInGroup = (group: GroupData, groupContentY: number) => {
  const viewportTop = scrollTop.value
  const viewportBottom = scrollTop.value + props.containerHeight
  
  const startIdx = Math.max(0, Math.floor((viewportTop - groupContentY) / props.rowHeight) - props.overscan)
  const endIdx = Math.min(
    group.records.length - 1,
    Math.ceil((viewportBottom - groupContentY) / props.rowHeight) + props.overscan
  )
  
  return group.records.slice(startIdx, endIdx + 1)
}

// 水平滚动相关
const totalWidth = computed(() => {
  return visibleFields.reduce((total, field) => total + field.width, 0) + 48 // 48px for checkbox
})

const showHorizontalScrollbar = computed(() => {
  return totalWidth.value > (containerRef.value?.clientWidth || 0)
})

const horizontalThumbWidth = computed(() => {
  const containerWidth = containerRef.value?.clientWidth || 0
  return Math.max(20, (containerWidth / totalWidth.value) * containerWidth)
})

const horizontalThumbLeft = computed(() => {
  const containerWidth = containerRef.value?.clientWidth || 0
  const maxScroll = totalWidth.value - containerWidth
  return maxScroll > 0 ? (scrollLeft.value / maxScroll) * (containerWidth - horizontalThumbWidth.value) : 0
})

// 列位置计算
const getColumnLeft = (index: number) => {
  let left = 48 // checkbox width
  for (let i = 0; i < index; i++) {
  left += visibleFields[i].width
  }
  return left
}

// Store数据
const { 
  visibleFields, 
  filteredRecords, 
  groupedRecords, 
  selectedRecords, 
  editingCell,
  toggleRecordSelection,
  selectAllRecords,
  clearSelection,
  startEditCell,
  finishEditCell,
  updateRecord
} = tableStore

const allSelected = computed(() => {
  return filteredRecords.length > 0 && selectedRecords.length === filteredRecords.length
})

// 滚动处理
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
  scrollLeft.value = target.scrollLeft
  
  isScrolling.value = true
  clearTimeout(scrollTimeout.value)
  scrollTimeout.value = setTimeout(() => {
    isScrolling.value = false
  }, 150)
}

let scrollTimeout = ref<number>()

// 列拖拽
const startColumnDrag = (event: DragEvent, index: number) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', index.toString())
    event.dataTransfer.effectAllowed = 'move'
  }
}

// 列宽调整
const startColumnResize = (event: MouseEvent, index: number) => {
  event.preventDefault()
  const startX = event.clientX
  const startWidth = visibleFields[index].width
  
  const handleMouseMove = (e: MouseEvent) => {
    const diff = e.clientX - startX
    const newWidth = Math.max(80, startWidth + diff)
  tableStore.updateField(visibleFields[index].id, { width: newWidth })
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = 'col-resize'
}

// 行拖拽
const startRowDrag = (event: DragEvent, record: Record, index: number) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify({ record, index }))
    event.dataTransfer.effectAllowed = 'move'
  }
}

// 水平滚动条拖拽
const startHorizontalDrag = (event: MouseEvent) => {
  event.preventDefault()
  const startX = event.clientX
  const startScrollLeft = scrollLeft.value
  const containerWidth = containerRef.value?.clientWidth || 0
  const maxScroll = totalWidth.value - containerWidth
  
  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX
    const scrollRatio = deltaX / (containerWidth - horizontalThumbWidth.value)
    const newScrollLeft = Math.max(0, Math.min(maxScroll, startScrollLeft + scrollRatio * maxScroll))
    
    if (scrollContainerRef.value) {
      scrollContainerRef.value.scrollLeft = newScrollLeft
    }
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 其他方法
const toggleSelectAll = () => {
  if (allSelected.value) {
    clearSelection()
  } else {
    selectAllRecords()
  }
}

const toggleGroup = (groupKey: string) => {
  const group = groupedRecords.find(g => g.key === groupKey)
  if (group) {
    group.expanded = !group.expanded
  }
}


const updateCell = (recordId: string, fieldId: string, value: any) => {
  updateRecord(recordId, { [fieldId]: value })
}

// 性能优化：使用 ResizeObserver 监听容器大小变化
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      // 容器大小变化时重新计算
      nextTick(() => {
        // 触发重新计算
      })
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }
})

// 监听数据变化，重置滚动位置
watch(() => filteredRecords.length, () => {
  if (scrollContainerRef.value) {
    scrollContainerRef.value.scrollTop = 0
    scrollTop.value = 0
  }
})
</script>

<style scoped>
.virtual-table {
  position: relative;
  height: 100%;
  overflow: hidden;
  background: white;
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  height: 40px;
}

.header-cell {
  position: relative;
  border-right: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  color: #374151;
  background: #f8fafc;
}

.checkbox-cell {
  width: 48px;
  justify-content: center;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  flex: 1;
  cursor: move;
  height: 100%;
}

.header-cell:hover  {
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

.table-body {
  position: relative;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.table-body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-body::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.table-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.table-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.visible-rows {
  position: relative;
}

.group-section {
  position: relative;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  font-weight: 500;
  height: 40px;
  position: sticky;
  top: 40px;
  z-index: 15;
}

.group-badge {
  padding: 4px 8px;
  border-radius: 12px;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.group-count {
  color: #64748b;
  font-size: 14px;
  font-weight: normal;
}

.group-content {
  background: white;
}

.scrollbar-track {
  position: absolute;
  background: #f1f5f9;
  border-radius: 4px;
}

.scrollbar-track.horizontal {
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
}

.scrollbar-thumb {
  position: absolute;
  background: #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 性能优化：减少重绘 */
.virtual-table * {
  will-change: transform;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .table-header {
    font-size: 12px;
  }
  
  .header-cell {
    min-width: 100px;
  }
  
  .checkbox-cell {
    width: 40px;
  }
}
</style>
