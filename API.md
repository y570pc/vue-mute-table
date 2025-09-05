# API 文档

## 概述

本文档描述了多维表格编辑器的核心 API 接口，包括状态管理、组件接口、工具函数等。

## 状态管理 API (Pinia Store)

### useTableStore

表格状态管理的核心 store，提供所有表格相关的状态和方法。

#### 状态 (State)

```typescript
interface TableState {
  // 数据模型
  fields: Field[]                    // 字段列表
  records: Record[]                  // 记录列表
  views: View[]                     // 视图列表
  
  // UI 状态
  currentViewId: string             // 当前视图 ID
  selectedRecords: string[]         // 选中的记录 ID 列表
  editingCell: { recordId: string; fieldId: string } | null  // 正在编辑的单元格
  
  // 数据处理
  filters: FilterCondition[]        // 筛选条件
  sorts: SortCondition[]            // 排序条件
  groupBy: string | null            // 分组字段 ID
}
```

#### 计算属性 (Computed)

```typescript
// 当前视图
const currentView = computed(() => View | null)

// 可见字段
const visibleFields = computed(() => Field[])

// 筛选后的记录
const filteredRecords = computed(() => Record[])

// 分组后的数据
const groupedRecords = computed(() => GroupData[])
```

#### 方法 (Actions)

##### 记录管理

```typescript
// 添加记录
addRecord(data?: Partial<Record>): Record | null

// 更新记录
updateRecord(id: string, data: Partial<Record>): void

// 删除记录
deleteRecord(id: string): void
```

**示例**:
```typescript
const tableStore = useTableStore()

// 添加新记录
const newRecord = tableStore.addRecord({
  title: "新任务",
  status: "待开始"
})

// 更新记录
tableStore.updateRecord("record-1", {
  status: "进行中",
  updatedAt: new Date().toISOString()
})

// 删除记录
tableStore.deleteRecord("record-1")
```

##### 字段管理

```typescript
// 添加字段
addField(field: Omit<Field, "id">): Field | null

// 更新字段
updateField(id: string, data: Partial<Field>): void

// 删除字段
deleteField(id: string): void

// 重排字段
reorderFields(oldIndex: number, newIndex: number): void
```

**示例**:
```typescript
// 添加新字段
const newField = tableStore.addField({
  name: "优先级",
  type: "select",
  width: 120,
  visible: true,
  options: ["高", "中", "低"]
})

// 更新字段
tableStore.updateField("field-1", {
  width: 150,
  required: true
})

// 重排字段
tableStore.reorderFields(0, 2) // 将第一个字段移动到第三个位置
```

##### 数据处理

```typescript
// 更新筛选条件
updateFilters(filters: FilterCondition[]): void

// 更新排序条件
updateSorts(sorts: SortCondition[]): void

// 更新分组字段
updateGroupBy(fieldId: string | null): void
```

**示例**:
```typescript
// 设置筛选条件
tableStore.updateFilters([
  {
    id: "filter-1",
    fieldId: "status",
    operator: "equals",
    value: "进行中"
  }
])

// 设置排序
tableStore.updateSorts([
  {
    fieldId: "createdAt",
    direction: "desc"
  }
])

// 设置分组
tableStore.updateGroupBy("priority")
```

##### 视图管理

```typescript
// 切换视图
switchView(viewId: string): void
```

##### 选择管理

```typescript
// 切换记录选择
toggleRecordSelection(recordId: string): void

// 全选记录
selectAllRecords(): void

// 清除选择
clearSelection(): void
```

##### 编辑管理

```typescript
// 开始编辑单元格
startEditCell(recordId: string, fieldId: string): void

// 完成编辑
finishEditCell(): void
```

##### 数据持久化

```typescript
// 保存到本地存储
saveToStorage(): void

// 从本地存储加载
loadFromStorage(): void

// 导出数据
exportData(): void
```

## 类型定义

### 核心类型

```typescript
// 字段类型
interface Field {
  id: string
  name: string
  type: "text" | "number" | "date" | "select" | "multiSelect" | "user" | "checkbox" | "url" | "email" | "phone"
  width: number
  visible: boolean
  required?: boolean
  options?: string[]
  defaultValue?: any
  description?: string
}

// 记录类型
interface Record {
  id: string
  createdAt: string
  updatedAt: string
  [key: string]: any
}

// 视图类型
interface View {
  id: string
  name: string
  type: "table" | "kanban" | "calendar" | "form"
  icon: string
  fields: string[]
  filters: FilterCondition[]
  sorts: SortCondition[]
  groupBy?: string
}

// 筛选条件
interface FilterCondition {
  id: string
  fieldId: string
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "starts_with" | "ends_with" | "is_empty" | "is_not_empty" | "greater_than" | "less_than" | "greater_equal" | "less_equal"
  value: any
  logic?: "and" | "or"
}

// 排序条件
interface SortCondition {
  fieldId: string
  direction: "asc" | "desc"
}

// 分组数据
interface GroupData {
  key: string
  label: string
  color: string
  records: Record[]
  expanded: boolean
}
```

## 组件 API

### VirtualTable 组件

虚拟表格的核心组件。

#### Props

```typescript
interface VirtualTableProps {
  containerHeight?: number    // 容器高度，默认 600
  rowHeight?: number         // 行高，默认 48
  overscan?: number          // 预渲染行数，默认 5
  groupHeaderHeight?: number // 分组头部高度，默认 40
}
```

#### Events

```typescript
interface VirtualTableEvents {
  // 记录选择
  'record-select': (recordId: string) => void
  'select-all': () => void
  'clear-selection': () => void
  
  // 单元格编辑
  'cell-edit': (recordId: string, fieldId: string) => void
  'cell-update': (recordId: string, fieldId: string, value: any) => void
  'cell-finish-edit': () => void
  
  // 拖拽
  'column-drag': (oldIndex: number, newIndex: number) => void
  'row-drag': (oldIndex: number, newIndex: number, groupKey?: string) => void
  
  // 列宽调整
  'column-resize': (fieldId: string, newWidth: number) => void
}
```

#### 使用示例

```vue
<template>
  <VirtualTable
    :container-height="600"
    :row-height="48"
    :overscan="5"
    @record-select="handleRecordSelect"
    @cell-edit="handleCellEdit"
    @cell-update="handleCellUpdate"
  />
</template>

<script setup lang="ts">
const handleRecordSelect = (recordId: string) => {
  console.log('Selected record:', recordId)
}

const handleCellEdit = (recordId: string, fieldId: string) => {
  console.log('Editing cell:', recordId, fieldId)
}

const handleCellUpdate = (recordId: string, fieldId: string, value: any) => {
  console.log('Cell updated:', recordId, fieldId, value)
}
</script>
```

### VirtualRow 组件

虚拟行组件，负责渲染单行数据。

#### Props

```typescript
interface VirtualRowProps {
  record: Record              // 记录数据
  fields: Field[]            // 字段列表
  index: number              // 行索引
  selected: boolean          // 是否选中
  editingCell: CellRef | null // 编辑状态
  scrollLeft: number         // 水平滚动位置
}
```

#### Events

```typescript
interface VirtualRowEvents {
  'select': (recordId: string) => void
  'edit-cell': (recordId: string, fieldId: string) => void
  'update-cell': (recordId: string, fieldId: string, value: any) => void
  'finish-edit': () => void
  'drag-start': (event: DragEvent, record: Record, index: number) => void
}
```

### CellRenderer 组件

单元格渲染组件，根据字段类型渲染不同的内容。

#### Props

```typescript
interface CellRendererProps {
  value: any        // 单元格值
  field: Field      // 字段定义
  record: Record    // 记录数据
  editing: boolean  // 是否正在编辑
}
```

### CellEditor 组件

单元格编辑组件，提供不同类型的编辑界面。

#### Props

```typescript
interface CellEditorProps {
  value: any        // 当前值
  field: Field      // 字段定义
  record: Record    // 记录数据
}
```

#### Events

```typescript
interface CellEditorEvents {
  'update': (value: any) => void
  'finish': () => void
  'cancel': () => void
}
```

## 工具函数 API

### 通用工具

```typescript
// 生成唯一 ID
function generateId(): string

// 格式化日期
function formatDate(date: string | Date): string

// 格式化日期时间
function formatDateTime(date: string | Date): string

// 防抖函数
function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void

// 节流函数
function throttle<T extends (...args: any[]) => any>(
  func: T, 
  limit: number
): (...args: Parameters<T>) => void
```

### 文件处理

```typescript
// 下载文件
function downloadFile(
  content: string, 
  filename: string, 
  type?: string
): void

// 复制到剪贴板
function copyToClipboard(text: string): Promise<void>
```

### 字段工具

```typescript
// 获取字段图标
function getFieldIcon(type: string): string

// 验证字段值
function validateField(value: any, field: Field): string | null
```

**示例**:
```typescript
import { generateId, formatDate, debounce, validateField } from '@/utils'

// 生成 ID
const id = generateId() // "abc123def456"

// 格式化日期
const formatted = formatDate(new Date()) // "2024/1/1"

// 防抖函数
const debouncedSearch = debounce((query: string) => {
  console.log('Searching for:', query)
}, 300)

// 验证字段
const error = validateField("invalid-email", {
  type: "email",
  required: true
}) // "请输入有效的邮箱地址"
```

## 事件系统

### 全局事件

使用 Mitt 事件发射器进行组件间通信。

```typescript
import mitt from 'mitt'

// 事件类型定义
interface Events {
  'table:record-added': Record
  'table:record-updated': { id: string; data: Partial<Record> }
  'table:record-deleted': string
  'table:field-added': Field
  'table:field-updated': { id: string; data: Partial<Field> }
  'table:field-deleted': string
  'table:view-switched': string
  'table:filter-applied': FilterCondition[]
  'table:sort-applied': SortCondition[]
  'table:group-changed': string | null
}

// 创建事件发射器
const emitter = mitt<Events>()

// 监听事件
emitter.on('table:record-added', (record) => {
  console.log('New record added:', record)
})

// 发射事件
emitter.emit('table:record-added', newRecord)
```

## 插件系统

### 插件接口

```typescript
interface TablePlugin {
  name: string
  version: string
  install(app: App, options?: any): void
  uninstall?(): void
}

// 插件示例
const customFieldPlugin: TablePlugin = {
  name: 'custom-field',
  version: '1.0.0',
  install(app, options) {
    // 注册自定义字段类型
    app.provide('customFieldTypes', options.fieldTypes)
  }
}
```

### 插件使用

```typescript
// 在 main.ts 中注册插件
import { createApp } from 'vue'
import App from './App.vue'
import { customFieldPlugin } from './plugins/custom-field'

const app = createApp(App)
app.use(customFieldPlugin, {
  fieldTypes: ['rich-text', 'file-upload']
})
```

## 性能监控 API

### 性能指标

```typescript
interface PerformanceMetrics {
  renderTime: number      // 渲染时间 (ms)
  memoryUsage: number     // 内存使用 (MB)
  fps: number            // 帧率
  interactionDelay: number // 交互延迟 (ms)
  recordCount: number    // 记录数量
  visibleRecords: number // 可见记录数量
}



### 使用示例

```typescript

// 执行操作
renderTable()

// 结束测量
const renderTime = monitor.endMeasure('table-render')

// 获取所有指标
const metrics = monitor.getMetrics()
console.log('Performance metrics:', metrics)
```

## 错误处理 API

### 错误类型

```typescript
interface TableError extends Error {
  code: string
  context?: any
  timestamp: number
}

// 错误代码
enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RENDER_ERROR = 'RENDER_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}
```

### 错误处理器

```typescript
class ErrorHandler {
  static captureError(error: Error, context?: any): void
  static reportError(error: TableError): void
  static showUserFriendlyMessage(error: TableError): void
}

// 使用示例
try {
  // 可能出错的操作
  tableStore.addRecord(invalidData)
} catch (error) {
  ErrorHandler.captureError(error, { action: 'addRecord', data: invalidData })
}
```

## 国际化 API

### 国际化配置

```typescript
interface I18nConfig {
  locale: string
  messages: Record<string, Record<string, string>>
  fallbackLocale: string
}

// 国际化工具
class I18n {
  constructor(config: I18nConfig)
  t(key: string, params?: Record<string, any>): string
  setLocale(locale: string): void
  getLocale(): string
}
```

### 使用示例

```typescript
import { I18n } from '@/utils/i18n'

const i18n = new I18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      'table.addRecord': '添加记录',
      'table.deleteRecord': '删除记录'
    },
    'en-US': {
      'table.addRecord': 'Add Record',
      'table.deleteRecord': 'Delete Record'
    }
  }
})

// 使用翻译
const text = i18n.t('table.addRecord') // "添加记录"
```

---

*本文档提供了多维表格编辑器的完整 API 参考，开发者可以根据此文档进行二次开发和集成。*
