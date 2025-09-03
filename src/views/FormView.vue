<template>
  <div class="form-view">
    <AppHeader />
    
    <div class="main-content">
      <AppSidebar />
      
      <main class="content">
<!--        <ViewTabs />-->
        
        <div class="form-container">
          <div class="form-header">
            <h2>数据录入表单</h2>
            <p>基于表格字段自动生成的数据录入表单</p>
          </div>
          
          <form @submit.prevent="submitForm" class="data-form">
            <div class="form-grid">
              <div 
                v-for="field in visibleFields"
                :key="field.id"
                class="form-field"
              >
                <label :for="field.id" class="field-label">
                  {{ field.name }}
                  <span v-if="field.required" class="required">*</span>
                </label>
                
                <FormField
                  :field="field"
                  :value="formData[field.id]"
                  @update="updateFormData(field.id, $event)"
                />
                
                <div v-if="field.description" class="field-description">
                  {{ field.description }}
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="resetForm" class="btn-secondary">
                重置
              </button>
              <button type="submit" class="btn-primary">
                提交
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTableStore } from '@/stores/table'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import ViewTabs from '@/components/ViewTabs.vue'
import FormField from '@/components/FormField.vue'

const tableStore = useTableStore()

const visibleFields = computed(() => tableStore.visibleFields)

const formData = ref<Record<string, any>>({})

const updateFormData = (fieldId: string, value: any) => {
  formData.value[fieldId] = value
}

const resetForm = () => {
  formData.value = {}
}

const submitForm = () => {
  // 验证表单
  const errors: string[] = []
  
  visibleFields.value.forEach(field => {
    if (field.required && !formData.value[field.id]) {
      errors.push(`${field.name}是必填字段`)
    }
  })
  
  if (errors.length > 0) {
    alert(errors.join('\n'))
    return
  }
  
  // 提交数据
  tableStore.addRecord(formData.value)
  resetForm()
  alert('数据提交成功！')
}
</script>

<style scoped>
.form-view {
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

.form-container {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.form-header p {
  color: #64748b;
  font-size: 14px;
}

.data-form {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

.field-description {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
}
</style>
