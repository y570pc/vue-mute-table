# 开发指南

## 开发环境搭建

### 系统要求

- **Node.js**: >= 18.0.0
- **包管理器**: npm >= 8.0.0 或 pnpm (推荐)
- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **浏览器**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### 快速开始

1. **克隆项目**
```bash
git clone <repository-url>
cd vue-mute-table
```

2. **安装依赖**
```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

3. **启动开发服务器**
```bash
pnpm dev
# 或
npm run dev
```

4. **访问应用**
打开浏览器访问 `http://localhost:3000`

### 开发工具配置

#### VS Code 推荐插件

```json
{
  "recommendations": [
    "Vue.volar",
    "Vue.vscode-typescript-vue-plugin",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "stylelint.vscode-stylelint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

#### VS Code 设置

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "vue.codeActions.enabled": true,
  "vue.complete.casing.tags": "kebab"
}
```

## 项目结构详解

```
vue-mute-table/
├── public/                 # 静态资源
├── src/                   # 源代码
│   ├── components/        # 组件
│   │   ├── modals/       # 模态框组件
│   │   ├── VirtualTable.vue
│   │   ├── TableToolbar.vue
│   │   └── ...
│   ├── views/            # 页面组件
│   │   ├── TableView.vue
│   │   ├── KanbanView.vue
│   │   └── FormView.vue
│   ├── stores/           # 状态管理
│   │   └── table.ts
│   ├── types/            # 类型定义
│   │   └── index.ts
│   ├── utils/            # 工具函数
│   │   └── index.ts
│   ├── router/           # 路由配置
│   │   └── index.ts
│   ├── styles/           # 样式文件
│   │   └── variables.scss
│   ├── App.vue           # 根组件
│   └── main.ts           # 应用入口
├── tests/                # 测试文件
├── docs/                 # 文档
├── .github/              # GitHub 配置
├── .vscode/              # VS Code 配置
├── package.json          # 项目配置
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
├── tailwind.config.js    # Tailwind 配置
└── README.md             # 项目说明
```

## 开发规范

### 代码风格

#### 1. 命名规范

```typescript
// 组件名：PascalCase
// 文件名：PascalCase.vue
VirtualTable.vue
TableToolbar.vue

// 变量名：camelCase
const tableStore = useTableStore()
const visibleFields = computed(() => ...)

// 常量名：UPPER_SNAKE_CASE
const MAX_RECORDS = 10000
const DEFAULT_ROW_HEIGHT = 48

// 类型名：PascalCase
interface TableState { }
type FieldType = 'text' | 'number'

// 枚举名：PascalCase
enum ViewType {
  TABLE = 'table',
  KANBAN = 'kanban'
}
```

#### 2. 文件组织

```typescript
// 组件文件结构
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 1. 导入
import { ref, computed, onMounted } from 'vue'
import { useTableStore } from '@/stores/table'

// 2. 类型定义
interface Props {
  // props 类型
}

interface Emits {
  // events 类型
}

// 3. Props 和 Emits
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 4. 响应式数据
const data = ref()

// 5. 计算属性
const computed = computed(() => {})

// 6. 方法
const method = () => {}

// 7. 生命周期
onMounted(() => {})
</script>

<style scoped>
/* 样式内容 */
</style>
```

#### 3. 注释规范

```typescript
/**
 * 虚拟表格组件
 * 支持虚拟滚动、分组、筛选等功能
 */
export default defineComponent({
  name: 'VirtualTable',
  
  /**
   * 组件属性
   */
  props: {
    /**
     * 容器高度
     * @default 600
     */
    containerHeight: {
      type: Number,
      default: 600
    }
  },
  
  setup(props) {
    /**
     * 计算可见行数
     * @param scrollTop 滚动位置
     * @returns 可见行数
     */
    const calculateVisibleRows = (scrollTop: number): number => {
      return Math.ceil(props.containerHeight / ROW_HEIGHT)
    }
    
    return {
      calculateVisibleRows
    }
  }
})
```

### Git 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 功能新增
git commit -m "feat: add virtual scrolling support"

# 问题修复
git commit -m "fix: resolve memory leak in virtual table"

# 文档更新
git commit -m "docs: update API documentation"

# 样式调整
git commit -m "style: format code with prettier"

# 重构代码
git commit -m "refactor: optimize virtual scroll algorithm"

# 性能优化
git commit -m "perf: improve rendering performance"

# 测试相关
git commit -m "test: add unit tests for table store"

# 构建相关
git commit -m "build: update vite configuration"
```

### 分支管理

```bash
# 主分支
main                    # 生产环境分支
develop                 # 开发环境分支

# 功能分支
feature/virtual-scroll  # 新功能开发
feature/kanban-view     # 新功能开发

# 修复分支
hotfix/memory-leak      # 紧急修复
bugfix/scroll-issue     # 问题修复

# 发布分支
release/v1.2.0          # 版本发布
```


## 构建和部署

### 1. 构建配置

#### Vite 配置优化
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['lucide-vue-next'],
          'utils-vendor': ['lodash-es', 'date-fns']
        }
      }
    },
    
    // 压缩配置
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

#### 环境变量配置
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_DEBUG=true

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_DEBUG=false
```

### 2. 部署流程

#### Docker 部署
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx 配置
```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # 处理 SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 3. CI/CD 配置

#### GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # 部署脚本
          echo "Deploying to production..."
```

## 性能优化

### 1. 代码分割

```typescript
// 路由懒加载
const routes = [
  {
    path: '/kanban',
    component: () => import('@/views/KanbanView.vue')
  },
  {
    path: '/form',
    component: () => import('@/views/FormView.vue')
  }
]

// 组件懒加载
const LazyComponent = defineAsyncComponent(() => import('./LazyComponent.vue'))
```

### 2. 虚拟滚动优化

```typescript
// 优化虚拟滚动性能
const virtualScrollConfig = {
  rowHeight: 48,
  overscan: 5, // 预渲染行数
  bufferSize: 20, // 缓冲区大小
  throttleDelay: 16 // 节流延迟
}
```

### 3. 状态管理优化

```typescript
// 使用 shallowRef 处理大型对象
const largeData = shallowRef(bigObject)

// 避免不必要的响应式转换
const nonReactiveData = markRaw(staticData)

// 使用 computed 缓存计算结果
const expensiveValue = computed(() => {
  return heavyCalculation()
})
```

## 故障排除

### 常见问题

#### 1. 虚拟滚动卡顿
```typescript
// 检查 rowHeight 设置
const rowHeight = 48 // 确保与实际行高一致

// 检查 overscan 设置
const overscan = 5 // 不要设置过大

// 检查滚动事件处理
const handleScroll = throttle((event) => {
  // 滚动处理逻辑
}, 16) // 限制在 60fps
```

#### 2. 内存泄漏
```typescript
// 确保清理事件监听器
onUnmounted(() => {
  document.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})

// 清理定时器
const timer = setInterval(() => {}, 1000)
onUnmounted(() => clearInterval(timer))
```

#### 3. 类型错误
```typescript
// 确保类型定义正确
interface Props {
  containerHeight: number
  rowHeight: number
}

// 使用类型断言
const data = ref() as Ref<TableData>

// 使用类型守卫
function isTableData(data: any): data is TableData {
  return data && typeof data.records === 'object'
}
```

### 调试工具

#### 1. 性能分析
```typescript
// 使用 Performance API
const startTime = performance.now()
// ... 执行代码
const endTime = performance.now()
console.log(`Execution time: ${endTime - startTime}ms`)
```

#### 2. 内存分析
```typescript
// 检查内存使用
if (performance.memory) {
  console.log('Memory usage:', {
    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
  })
}
```

---

*本开发指南提供了完整的开发流程和最佳实践，帮助开发者高效地开发和维护项目。*
