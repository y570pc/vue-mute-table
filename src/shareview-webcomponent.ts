// src/shareview-webcomponent.ts
import './style.css' // ✅ 1. 引入包含 Tailwind 的 CSS（关键！）

import { defineCustomElement, h,createApp } from 'vue'
import { createPinia } from 'pinia'
import ShareView from './views/ShareView.vue'

// 定义 Web Component
const ShareViewElement = defineCustomElement({
  // 继承 ShareView 组件
  extends: ShareView,

  // setup 函数用于注入依赖
  setup(props) {
    // 创建 Pinia 实例
    const pinia = createPinia()

    // 创建一个临时应用来使用插件和 provide
    const app = createApp({})
    app.use(pinia)

    // 在 setup 中 provide，子组件可通过 inject('pinia') 获取
    // 注意：defineCustomElement 的子组件需要手动 provide
    return () => h(ShareView, { ...props, pinia }) // 将 pinia 作为 prop 传入
  },

  // ⚠️ 如果 ShareView 内部使用 <script setup>，需确保它能接收 pinia prop
}, { shadowRoot: false })

// 注册自定义元素
customElements.define('share-view', ShareViewElement)

// 可选：导出以便在其他地方动态使用
export default ShareViewElement