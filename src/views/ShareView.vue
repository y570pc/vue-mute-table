<template>
  <div class="table-view">
    
    <div class="main-content">
      
      <!-- 主要内容区域 -->
      <main class="content">
        
        <!-- 表格容器 -->
        <ShareContainer />
      </main>
    </div>
    

    

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTableStore } from '@/stores/table'
import { storeToRefs } from 'pinia'
import ShareContainer from '@/components/ShareContainer.vue'

const props = withDefaults(
  defineProps<{
    stepName: string
  }>(),
  {
    stepName: 'default-step' // 设置默认值
  }
)

const tableStore = useTableStore()

// 2. 从 store 中解构出需要的状态
const { fields, records } = storeToRefs(tableStore)

// 3. 在组件挂载后，使用 props 中的 shareId 调用 action
onMounted(() => {
  if (props.stepName) {
    tableStore.fetchTableData(props.stepName)
  } else {
    // 如果没有传入 stepName，可以在这里设置一个错误状态
    console.error('ShareView: 未提供 stepName prop。')
  }
})


</script>

<style>


.table-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
