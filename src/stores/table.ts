import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { Field, Record, View, FilterGroup, SortCondition,TopLevelFilter,FilterRule } from "@/types"
import { generateId } from "@/utils"

// Helper to check if a rule is a group
function isFilterGroup(rule: FilterRule | FilterGroup): rule is FilterGroup {
  return 'logic' in rule && 'rules' in rule;
}


export const useTableStore = defineStore("table", () => {
  // 状态 - 添加默认值
  // 1. 将 state 的初始值设置为空数组
  const fields = ref<Field[]>([])
  const records = ref<Record[]>([])
  
  // 2. 添加用于 UI 反馈的新状态
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const views = ref<View[]>([
    {
      id: "table",
      name: "任务管理表",
      type: "table",
      icon: "Table",
      fields: fields.value.map((f) => f.id),
      filters: { id: generateId(), logic: 'and', rules: [] },
      sorts: [],
    },
    // {
    //   id: "kanban",
    //   name: "进度看板",
    //   type: "kanban",
    //   icon: "Kanban",
    //   fields: fields.value.map((f) => f.id),
    //   filters: [],
    //   sorts: [],
    //   groupBy: "status",
    // },
    {
      id: "form",
      name: "表单视图",
      type: "form",
      icon: "FileText",
      fields: fields.value.map((f) => f.id),
      filters: { id: generateId(), logic: 'and', rules: [] },
      sorts: [],
    },
  ])

  const filters = ref<TopLevelFilter>({ id: 'root', logic: 'and', rules: [] });
  const currentViewId = ref("table")
  const selectedRecords = ref<string[]>([])
  const editingCell = ref<{ recordId: string; fieldId: string } | null>(null)
  const sorts = ref<SortCondition[]>([])
  const groupBy = ref<string | null>("priority")

  // 计算属性 - 添加安全检查
  const currentView = computed(() => views.value?.find((v) => v.id === currentViewId.value) || null)
  const visibleFields = computed(() => (fields.value || []).filter((field) => field.visible))
  const filteredRecords = computed(() => {
    let result = [...records.value];
    // Apply advanced filters if there are any rules
    if (filters.value &&  Array.isArray(filters.value.rules) && filters.value.rules.length > 0) {
      result = result.filter(record => evaluateGroup(record, filters.value));
    }

    // Sorting logic remains the same
    if (sorts.value && sorts.value.length > 0) {
      result.sort((a, b) => {
        for (const sort of sorts.value) {
          const aValue = a[sort.fieldId];
          const bValue = b[sort.fieldId];
          let comparison = 0;
          if (aValue < bValue) comparison = -1;
          else if (aValue > bValue) comparison = 1;
          if (comparison !== 0) {
            return sort.direction === "desc" ? -comparison : comparison;
          }
        }
        return 0;
      });
    }
    return result;
  })

  // action
  const setFilters = (newFilters: TopLevelFilter) => {
    filters.value = newFilters
  }

  const updateFilters = (newFilters: TopLevelFilter) => {
    filters.value = newFilters || { id: 'root', logic: 'and', rules: [] };
  };

  const groupedRecords = computed(() => {
    if (!groupBy.value) return []

    const groups = new Map<string, Record[]>()
    const field = fields.value?.find((f) => f.id === groupBy.value)

    if (filteredRecords.value) {
      filteredRecords.value.forEach((record) => {
        const value = record[groupBy.value!] || "未分组"
        if (!groups.has(value)) {
          groups.set(value, [])
        }
        groups.get(value)!.push(record)
      })
    }

    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#a8e6cf", "#ff8b94"]
    let colorIndex = 0

    return Array.from(groups.entries()).map(([key, records]) => ({
      key,
      label: key,
      color: colors[colorIndex++ % colors.length],
      records,
      expanded: true,
    }))
  })

  // 方法 - 添加错误处理
  // 3. 创建一个 action 来从 Flask API 获取数据
  const fetchTableData = async (stepName: string) => {
    isLoading.value = true
    error.value = null
    
    // 请将此 URL 替换为您真实的 Flask API 地址
    const FLASK_API_URL = `http://127.0.0.1:5000/api/shared-data/${stepName}`;

    try {
      const response = await fetch(FLASK_API_URL)
      if (!response.ok) {
        throw new Error(`网络请求失败，状态码: ${response.status}`)
      }
      
      // 假设 API 返回的数据结构为 { fields: [...], records: [...] }
      const data = await response.json()

      // 使用从 API 获取的数据更新 state
      fields.value = data.fields
      records.value = data.records



    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "发生未知错误"
      console.error("从 Flask API 获取数据失败:", errorMessage)
      error.value = errorMessage
    } finally {
      isLoading.value = false
    }
  }


  const addRecord = (data: Partial<Record> = {}) => {
    try {
      const newRecord: Record = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: "新任务",
        details: "",
        assignee: "",
        status: "待开始",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        isOverdue: false,
        completedDate: "",
        priority: "重要不紧急",
        ...data,
      }
      records.value.push(newRecord)
      saveToStorage()
      return newRecord
    } catch (error) {
      console.error("添加记录失败:", error)
      return null
    }
  }

  const updateRecord = (id: string, data: Partial<Record>) => {
    try {
      const index = records.value?.findIndex((r) => r.id === id) ?? -1
      if (index !== -1) {
        records.value[index] = {
          ...records.value[index],
          ...data,
          updatedAt: new Date().toISOString(),
        }
        saveToStorage()
      }
    } catch (error) {
      console.error("更新记录失败:", error)
    }
  }

  const deleteRecord = (id: string) => {
    try {
      const index = records.value?.findIndex((r) => r.id === id) ?? -1
      if (index !== -1) {
        records.value.splice(index, 1)
        selectedRecords.value = selectedRecords.value.filter((rid) => rid !== id)
        saveToStorage()
      }
    } catch (error) {
      console.error("删除记录失败:", error)
    }
  }

  const addField = (field: Omit<Field, "id">) => {
    try {
      const newField: Field = {
        id: generateId(),
        ...field,
      }
      fields.value.push(newField)
      saveToStorage()
      return newField
    } catch (error) {
      console.error("添加字段失败:", error)
      return null
    }
  }

  const updateField = (id: string, data: Partial<Field>) => {
    try {
      const index = fields.value?.findIndex((f) => f.id === id) ?? -1
      if (index !== -1) {
        fields.value[index] = { ...fields.value[index], ...data }
        saveToStorage()
      }
    } catch (error) {
      console.error("更新字段失败:", error)
    }
  }

  const deleteField = (id: string) => {
    try {
      const index = fields.value?.findIndex((f) => f.id === id) ?? -1
      if (index !== -1) {
        fields.value.splice(index, 1)
        // 清理记录中的相关数据
        records.value?.forEach((record) => {
          delete record[id]
        })
        saveToStorage()
      }
    } catch (error) {
      console.error("删除字段失败:", error)
    }
  }

  const reorderFields = (oldIndex: number, newIndex: number) => {
    try {
      if (
          !fields.value ||
          oldIndex < 0 ||
          newIndex < 0 ||
          oldIndex >= fields.value.length ||
          newIndex >= fields.value.length
      ) {
        return
      }
      const field = fields.value.splice(oldIndex, 1)[0]
      fields.value.splice(newIndex, 0, field)
      saveToStorage()
    } catch (error) {
      console.error("重排字段失败:", error)
    }
  }

  const reorderRecords = (oldIndex: number, newIndex: number, groupKey?: string) => {
    try {
      if (groupKey) {
        // 处理分组内的排序
        const group = groupedRecords.value?.find((g) => g.key === groupKey)
        if (group && group.records) {
          const record = group.records.splice(oldIndex, 1)[0]
          group.records.splice(newIndex, 0, record)

          // 更新原始数据
          const originalIndex = records.value?.findIndex((r) => r.id === record.id) ?? -1
          if (originalIndex !== -1) {
            records.value.splice(originalIndex, 1)
            records.value.splice(newIndex, 0, record)
          }
        }
      } else {
        if (
            !records.value ||
            oldIndex < 0 ||
            newIndex < 0 ||
            oldIndex >= records.value.length ||
            newIndex >= records.value.length
        ) {
          return
        }
        const record = records.value.splice(oldIndex, 1)[0]
        records.value.splice(newIndex, 0, record)
      }
      saveToStorage()
    } catch (error) {
      console.error("重排记录失败:", error)
    }
  }



  const evaluateRule = (record: Record, rule: FilterRule): boolean => {
    const value = record[rule.fieldId];
    const filterValue = rule.value;
    switch (rule.operator) {
      case "equals": return value === filterValue;
      case "not_equals": return value !== filterValue;
      case "contains": return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
      case "not_contains": return !String(value).toLowerCase().includes(String(filterValue).toLowerCase());
      case "starts_with": return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
      case "ends_with": return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
      case "is_empty": return value === null || value === undefined || value === "";
      case "is_not_empty": return value !== null && value !== undefined && value !== "";
      case "greater_than": return Number(value) > Number(filterValue);
      case "less_than": return Number(value) < Number(filterValue);
      case "greater_equal": return Number(value) >= Number(filterValue);
      case "less_equal": return Number(value) <= Number(filterValue);
      default: return true;
    }
  };  

  const evaluateGroup = (record: Record, group: FilterGroup): boolean => {
    const evaluator = (rule: FilterRule | FilterGroup) => 
      isFilterGroup(rule) ? evaluateGroup(record, rule) : evaluateRule(record, rule);

    if (group.logic === 'and') return group.rules.every(evaluator);
    if (group.logic === 'or') return group.rules.some(evaluator);
    return true;
  };


  const updateSorts = (newSorts: SortCondition[]) => {
    sorts.value = newSorts || []
  }

  const updateGroupBy = (fieldId: string | null) => {
    groupBy.value = fieldId
  }

  const switchView = (viewId: string) => {
    try {
      currentViewId.value = viewId
      const view = views.value?.find((v) => v.id === viewId)
      if (view) {
        filters.value = view.filters || { id: 'root', logic: 'and', rules: [] };
        sorts.value = view.sorts || []
        groupBy.value = view.groupBy || null
      }
    } catch (error) {
      console.error("切换视图失败:", error)
    }
  }

  const toggleRecordSelection = (recordId: string) => {
    try {
      if (!selectedRecords.value) {
        selectedRecords.value = []
      }
      const index = selectedRecords.value.indexOf(recordId)
      if (index > -1) {
        selectedRecords.value.splice(index, 1)
      } else {
        selectedRecords.value.push(recordId)
      }
    } catch (error) {
      console.error("切换记录选择失败:", error)
    }
  }

  const selectAllRecords = () => {
    try {
      selectedRecords.value = filteredRecords.value?.map((r) => r.id) || []
    } catch (error) {
      console.error("全选记录失败:", error)
    }
  }

  const clearSelection = () => {
    selectedRecords.value = []
  }

  const startEditCell = (recordId: string, fieldId: string) => {
    editingCell.value = { recordId, fieldId }
  }

  const finishEditCell = () => {
    editingCell.value = null
  }

  const saveToStorage = () => {
    try {
      const data = {
        fields: fields.value,
        records: records.value,
        views: views.value,
        currentViewId: currentViewId.value,
        filters: filters.value,
        sorts: sorts.value,
        groupBy: groupBy.value,
      }
      localStorage.setItem("multidimensional-table-data", JSON.stringify(data))
    } catch (error) {
      console.error("保存到本地存储失败:", error)
    }
  }

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem("multidimensional-table-data")
      if (stored) {
        const data = JSON.parse(stored)
        if (data.fields) fields.value = data.fields
        if (data.records) records.value = data.records
        if (data.views) views.value = data.views
        if (data.currentViewId) currentViewId.value = data.currentViewId
        if (data.filters) filters.value = data.filters
        if (data.sorts) sorts.value = data.sorts
        if (data.groupBy !== undefined) groupBy.value = data.groupBy
      }
    } catch (error) {
      console.error("从本地存储加载失败:", error)
    }
  }

  const exportData = () => {
    try {
      const data = {
        fields: fields.value,
        records: records.value,
        exportedAt: new Date().toISOString(),
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `table-data-${new Date().toISOString().split("T")[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("导出数据失败:", error)
    }
  }

  const importData = (json: string) => {
    try {
      const data = JSON.parse(json)
      if (data.fields) fields.value = data.fields
      if (data.records) records.value = data.records
      if (data.views) views.value = data.views
      if (data.currentViewId) currentViewId.value = data.currentViewId
      if (data.filters) filters.value = data.filters
      if (data.sorts) sorts.value = data.sorts
      if (data.groupBy !== undefined) groupBy.value = data.groupBy
    } catch (error) {
      console.error("导入数据失败:", error)
    }
  }

  const loadShareData = (sharedFields: Field[], sharedRecords: Record[]) => {
    fields.value = sharedFields;
    records.value = sharedRecords;
    filters.value = { id: 'root', logic: 'and', rules: [] };
    sorts.value = [];
    groupBy.value = null;
    selectedRecords.value = [];
    editingCell.value = null;
  };

  return {
    // 状态
    fields,
    records,
    views,
    currentViewId,
    selectedRecords,
    editingCell,
    filters,
    sorts,
    groupBy,

    // 计算属性
    currentView,
    visibleFields,
    filteredRecords,
    groupedRecords,

    // 方法
    fetchTableData,
    addRecord,
    updateRecord,
    deleteRecord,
    addField,
    updateField,
    deleteField,
    reorderFields,
    reorderRecords,
    updateFilters,
    updateSorts,
    updateGroupBy,
    switchView,
    toggleRecordSelection,
    selectAllRecords,
    clearSelection,
    startEditCell,
    finishEditCell,
    saveToStorage,
    loadFromStorage,
    exportData,
    setFilters,
    importData,
    loadShareData
  }
})
