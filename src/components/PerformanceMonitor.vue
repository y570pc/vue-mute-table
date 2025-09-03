<template>
  <div class="performance-monitor" v-if="showMonitor">
    <div class="monitor-header">
      <h4>性能监控</h4>
      <button @click="toggleMonitor" class="close-btn">
        <X class="w-4 h-4" />
      </button>
    </div>
    
    <div class="monitor-stats">
      <div class="stat-item">
        <span class="stat-label">总记录数:</span>
        <span class="stat-value">{{ totalRecords.toLocaleString() }}</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">可见记录数:</span>
        <span class="stat-value">{{ visibleRecords }}</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">渲染时间:</span>
        <span class="stat-value">{{ renderTime }}ms</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">FPS:</span>
        <span class="stat-value" :class="{ 'low-fps': fps < 30 }">{{ fps }}</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">内存使用:</span>
        <span class="stat-value">{{ memoryUsage }}MB</span>
      </div>
    </div>
    
    <div class="monitor-chart">
      <canvas ref="chartRef" width="200" height="60"></canvas>
    </div>
  </div>
  
  <button 
    v-else
    @click="toggleMonitor" 
    class="monitor-toggle"
    title="显示性能监控"
  >
    <Activity class="w-4 h-4" />
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { X, Activity } from 'lucide-vue-next'

interface Props {
  totalRecords: number
  visibleRecords: number
}

const props = defineProps<Props>()

const showMonitor = ref(false)
const chartRef = ref<HTMLCanvasElement>()

const renderTime = ref(0)
const fps = ref(60)
const memoryUsage = ref(0)
const fpsHistory = ref<number[]>([])

let animationId: number
let lastTime = 0
let frameCount = 0

const toggleMonitor = () => {
  showMonitor.value = !showMonitor.value
}

const measurePerformance = () => {
  const startTime = performance.now()
  
  // 模拟渲染时间测量
  requestAnimationFrame(() => {
    renderTime.value = Math.round(performance.now() - startTime)
  })
}

const updateFPS = (currentTime: number) => {
  frameCount++
  
  if (currentTime - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
    fpsHistory.value.push(fps.value)
    
    if (fpsHistory.value.length > 50) {
      fpsHistory.value.shift()
    }
    
    frameCount = 0
    lastTime = currentTime
    
    drawChart()
  }
  
  animationId = requestAnimationFrame(updateFPS)
}

const updateMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    memoryUsage.value = Math.round(memory.usedJSHeapSize / 1024 / 1024)
  }
}

const drawChart = () => {
  if (!chartRef.value) return
  
  const canvas = chartRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const width = canvas.width
  const height = canvas.height
  
  // 清空画布
  ctx.clearRect(0, 0, width, height)
  
  // 绘制背景
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, width, height)
  
  // 绘制网格线
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  
  for (let i = 0; i <= 4; i++) {
    const y = (height / 4) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  
  // 绘制FPS曲线
  if (fpsHistory.value.length > 1) {
    ctx.strokeStyle = fps.value < 30 ? '#ef4444' : '#10b981'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    fpsHistory.value.forEach((value, index) => {
      const x = (width / (fpsHistory.value.length - 1)) * index
      const y = height - (value / 60) * height
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.stroke()
  }
  
  // 绘制标签
  ctx.fillStyle = '#64748b'
  ctx.font = '10px sans-serif'
  ctx.fillText('60', 2, 12)
  ctx.fillText('30', 2, height / 2 + 4)
  ctx.fillText('0', 2, height - 2)
}

onMounted(() => {
  animationId = requestAnimationFrame(updateFPS)
  
  // 定期更新内存使用情况
  const memoryInterval = setInterval(updateMemoryUsage, 1000)
  
  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    clearInterval(memoryInterval)
  })
})

// 暴露性能测量方法
defineExpose({
  measurePerformance
})
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  top: 80px;
  right: 120px;
  width: 240px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  font-size: 12px;
}

.monitor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 8px 8px 0 0;
}

.monitor-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.close-btn {
  padding: 4px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  color: #64748b;
}

.close-btn:hover {
  background: #e2e8f0;
}

.monitor-stats {
  padding: 12px 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: #64748b;
}

.stat-value {
  font-weight: 600;
  color: #374151;
}

.stat-value.low-fps {
  color: #ef4444;
}

.monitor-chart {
  padding: 12px 16px;
  border-top: 1px solid #e2e8f0;
}

.monitor-toggle {
  position: fixed;
  top: 76px;
  right: 120px;
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  color: #64748b;
}

.monitor-toggle:hover {
  background: #f8fafc;
  color: #374151;
}

/* 移动端隐藏性能监控 */
@media (max-width: 768px) {
  .performance-monitor,
  .monitor-toggle {
    display: none;
  }
}
</style>
