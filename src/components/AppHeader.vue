<template>
  <header class="app-header">
    <div class="header-left">
      <button class="back-btn" @click="goBack">
        <ChevronLeft class="w-4 h-4" />
      </button>
      <div class="breadcrumb">
        <span class="breadcrumb-item">趣谈AI</span>
        <ChevronRight class="w-4 h-4 text-gray-400" />
        <span class="breadcrumb-item current">任务管理</span>
      </div>
    </div>
    <div class="header-right">

    </div>
  </header>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, Share, Settings, MoreHorizontal } from 'lucide-vue-next'

const goBack = () => {
  // 返回逻辑
  console.log('Go back')
}
</script>

<style scoped>
.app-header {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  padding: 8px;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: #f1f5f9;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.breadcrumb-item {
  color: #64748b;
}

.breadcrumb-item.current {
  color: #1e293b;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
  transition: background-color 0.2s;
}

.header-btn:hover {
  background: #f8fafc;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 12px;
  }

  .header-btn {
    padding: 6px 8px;
    font-size: 12px;
  }

  .header-btn span {
    display: none;
  }
}
</style>
