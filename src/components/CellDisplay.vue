<template>
  <div class="cell-display" :class="{ clickable: !editing }">
    <!-- 文本类型 -->
    <span v-if="field.type === 'text'" class="cell-text">
      {{ displayValue }}
    </span>

    <!-- 数字类型 -->
    <span v-else-if="field.type === 'number'" class="cell-number">
      {{ formatNumber(value) }}
    </span>

    <!-- 日期类型 -->
    <span v-else-if="field.type === 'date'" class="cell-date">
      {{ formatDate(value) }}
    </span>

    <!-- 选择类型 -->
    <div v-else-if="field.type === 'select'" class="cell-select">
      <span v-if="value" class="select-tag" :class="getSelectClass(value)">
        {{ value }}
      </span>
      <span v-else class="empty-value">-</span>
    </div>

    <!-- 多选类型 -->
    <div v-else-if="field.type === 'multiSelect'" class="cell-multi-select">
      <span
          v-for="item in (Array.isArray(value) ? value : [])"
          :key="item"
          class="multi-select-tag"
      >
        {{ item }}
      </span>
      <span v-if="!value || (Array.isArray(value) && value.length === 0)" class="empty-value">-</span>
    </div>

    <!-- 用户类型 -->
    <div v-else-if="field.type === 'user'" class="cell-user">
      <div v-if="value" class="user-info">
        <div class="user-avatar">
          {{ getUserInitial(value) }}
        </div>
        <span class="user-name">{{ value }}</span>
      </div>
      <span v-else class="empty-value">-</span>
    </div>

    <!-- 复选框类型 -->
    <div v-else-if="field.type === 'checkbox'" class="cell-checkbox">
      <div class="checkbox-display" :class="{ checked: !!value }">
        <Check v-if="!!value" class="w-3 h-3" />
        <X v-else class="w-3 h-3" />
      </div>
    </div>

    <!-- URL类型 -->
    <div v-else-if="field.type === 'url'" class="cell-url">
      <a
          v-if="value && isValidUrl(value)"
          :href="value"
          target="_blank"
          class="url-link"
          @click.stop
      >
        <ExternalLink class="w-3 h-3" />
        {{ formatUrl(value) }}
      </a>
      <span v-else class="empty-value">-</span>
    </div>

    <!-- 邮箱类型 -->
    <div v-else-if="field.type === 'email'" class="cell-email">
      <a
          v-if="value && isValidEmail(value)"
          :href="`mailto:${value}`"
          class="email-link"
          @click.stop
      >
        <Mail class="w-3 h-3" />
        {{ value }}
      </a>
      <span v-else class="empty-value">-</span>
    </div>

    <!-- 电话类型 -->
    <div v-else-if="field.type === 'phone'" class="cell-phone">
      <a
          v-if="value"
          :href="`tel:${value}`"
          class="phone-link"
          @click.stop
      >
        <Phone class="w-3 h-3" />
        {{ value }}
      </a>
      <span v-else class="empty-value">-</span>
    </div>

    <!-- sparkline类型 -->
    <div v-else-if="field.type === 'sparkline'" class="cell-sparkline" style="height:30px;width:100%;">
      <Line v-if="value" :data="sparklineData" :options="sparklineOptions"  />
      <span v-else class="empty-value">-</span>
    </div>


    <!-- 默认类型 -->
    <span v-else class="cell-text" :title="displayValue">
      {{ displayValue }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Title } from 'chart.js'
import { Check, X, ExternalLink, Mail, Phone } from 'lucide-vue-next'
import type { Field } from '@/types'


Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title)
interface Props {
  value: any
  field: Field
  editing?: boolean
}

const props = defineProps<Props>()

const sparklineData = computed(() => {
  const values = String(props.value).split(',').map(Number).filter(v => !isNaN(v))
  return {
    labels: values.map((_, i) => i + 1),
    datasets: [
      {
        data: values,
        borderColor: '#3b82f6',
        borderWidth: 1,
        pointRadius: 2,
        fill: false,
        tension: 0.3
      }
    ]
  }
})

const sparklineOptions = {
  responsive: true,
  plugins: { legend: { display: false }, title: { display: false } },
  scales: {
    x: { display: false },
    y: { display: false }
  },
  elements: { line: { borderWidth: 2 }, point: { radius: 0 } }
}




const displayValue = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') return '-'
  return String(props.value)
})

const formatNumber = (value: any) => {
  if (value === null || value === undefined || value === '') return '-'
  const num = Number(value)
  return isNaN(num) ? '-' : num.toLocaleString()
}

const formatDate = (value: any) => {
  if (!value) return '-'
  try {
    const date = new Date(value)
    return date.toLocaleDateString('zh-CN')
  } catch {
    return '-'
  }
}

const formatUrl = (url: string) => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

const getUserInitial = (name: string) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

// const getSelectClass = (value: string) => {
//   const classMap: Record<string, string> = {
//     '重要紧急': 'priority-urgent',
//     '紧急不重要': 'priority-important',
//     '重要不紧急': 'priority-normal',
//     "充电":'status-charge',
//     "放电":'status-discharge',
//   }
//   return classMap[value] || 'status-default'
// }


const DEFAULT_COLORS = [
  'bg-blue-100 text-blue-800',      // 蓝
  'bg-green-100 text-green-800',    // 绿
  'bg-yellow-100 text-yellow-800',  // 黄
  'bg-purple-100 text-purple-800',  // 紫
  'bg-pink-100 text-pink-800',      // 粉
  'bg-indigo-100 text-indigo-800',  // 靛
  'bg-red-100 text-red-800',        // 红
  'bg-orange-100 text-orange-800',  // 橙
  'bg-teal-100 text-teal-800',      // 青
  'bg-gray-100 text-gray-800',      // 灰
];

const getStringHashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转为32位整数
  }
  return Math.abs(hash);
};

const getDynamicColorClass = (value: string): string => {
  const index = getStringHashCode(value) % DEFAULT_COLORS.length;
  return DEFAULT_COLORS[index];
};

const SELECT_CLASS_MAP = {
  '重要紧急': 'priority-urgent',
  '紧急不重要': 'priority-important',
  '重要不紧急': 'priority-normal',
  '充电': 'status-charge',
  '放电': 'status-discharge',
} as const;

const getSelectClass = (value: string): string => {
  if (!value) return 'status-default';

  const selectClassMap = SELECT_CLASS_MAP as { [key: string]: string };
  
  // 先查预定义映射
  if (selectClassMap[value]) {
    return selectClassMap[value];
  }

  // 否则使用 10 色动态分配
  return getDynamicColorClass(value);
};

const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
</script>

<style scoped>
.cell-display {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  min-height: 48px;
}

.cell-display.clickable {
  cursor: pointer;
}

.cell-text,
.cell-number,
.cell-date {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.cell-number {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.empty-value {
  color: #9ca3af;
  font-style: italic;
}

.select-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}


.status-charge {
  background: #d5edd1;
  color: #09a959;
}

.status-discharge {
  background: #fecaca;
  color: #dc2626;
}


.priority-urgent {
  background: #fecaca;
  color: #dc2626;
}

.priority-important {
  background: #fed7aa;
  color: #ea580c;
}

.priority-normal {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-default {
  background: #f3f4f6;
  color: #374151;
}

.multi-select-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  margin-right: 4px;
  background: #f3f4f6;
  color: #374151;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
}

.user-info {
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

.checkbox-display {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox-display.checked {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.checkbox-display:not(.checked) {
  color: #ef4444;
}

.url-link,
.email-link,
.phone-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #3b82f6;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.url-link:hover,
.email-link:hover,
.phone-link:hover {
  text-decoration: underline;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .cell-display {
    min-height: 40px;
    font-size: 12px;
  }

  .user-avatar {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }

  .select-tag,
  .multi-select-tag {
    font-size: 10px;
    padding: 2px 6px;
  }
}
</style>
