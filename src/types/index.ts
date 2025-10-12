export interface Field {
  id: string
  name: string
  type: "text" | "number" | "date" | "select" | "multiSelect" | "user" | "checkbox" | "url" | "email" | "phone" | "sparkline"
  width: number
  visible: boolean
  required?: boolean
  options?: string[]
  defaultValue?: any
  description?: string
  tooltip?: string

}

export interface Record {
  id: string
  createdAt: string
  updatedAt: string
  [key: string]: any
}

// A single filter rule, e.g., "Status equals 'In Progress'"
export interface FilterRule {
  id: string; // Unique ID for UI purposes
  fieldId: string;
  operator: 
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "starts_with"
    | "ends_with"
    | "is_empty"
    | "is_not_empty"
    | "greater_than"
    | "less_than"
    | "greater_equal"
    | "less_equal";
  value: any;
}

// A group of filters connected by AND/OR logic
export interface FilterGroup {
  id: string; // Unique ID for UI purposes
  logic: 'and' | 'or';
  // Rules can be other groups, allowing for nesting
  rules: (FilterRule | FilterGroup)[]; 
}

// The top-level filter structure is a single group
export type TopLevelFilter = FilterGroup;


export interface View {
  id: string
  name: string
  type: "table" | "kanban" | "calendar" | "form"
  icon: string
  fields: string[]
  filters: TopLevelFilter // Updated type
  sorts: SortCondition[]
  groupBy?: string
}

export interface SortCondition {
  fieldId: string
  direction: "asc" | "desc"
}

export interface GroupData {
  key: string
  label: string
  color: string
  records: Record[]
  expanded: boolean
}

export interface TableState {
  fields: Field[]
  records: Record[]
  views: View[]
  currentViewId: string
  selectedRecords: string[]
  editingCell: { recordId: string; fieldId: string } | null
  filters: TopLevelFilter // Updated type
  sorts: SortCondition[]
  groupBy: string | null
}
