<template>
  <aside class="app-sidebar" :class="{ collapsed: sidebarCollapsed }">
    <div class="sidebar-header">
      <button class="collapse-btn" @click="toggleSidebar">
        <Menu class="w-4 h-4" />
      </button>
      <div class="search-box" v-if="!sidebarCollapsed">
        <Search class="w-4 h-4 text-gray-400" />
        <input type="text" placeholder="搜索" v-model="searchQuery" />
      </div>
    </div>

    <nav class="sidebar-nav" v-if="!sidebarCollapsed">
      <div class="nav-section">
        <div class="nav-item active">
          <CheckSquare class="w-4 h-4" />
          任务管理
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Menu,
  Search,
  CheckSquare,
  FileText,
  Database,
  BarChart3,
  PieChart
} from 'lucide-vue-next'

const sidebarCollapsed = ref(false)
const searchQuery = ref('')

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style scoped>
.app-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.app-sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  padding: 8px;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: background-color 0.2s;
}

.collapse-btn:hover {
  background: #f1f5f9;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  width: 100%;
  padding: 8px 8px 8px 32px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: #3b82f6;
}

.search-box svg {
  position: absolute;
  left: 8px;
  pointer-events: none;
}

.sidebar-nav {
  flex: 1;
  padding: 16px;
}

.nav-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
  margin-bottom: 2px;
  transition: background-color 0.2s;
}

.nav-item:hover {
  background: #f1f5f9;
}

.nav-item.active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}

@media (max-width: 768px) {
  .app-sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    height: calc(100vh - 60px);
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .app-sidebar.show {
    transform: translateX(0);
  }
}
</style>
