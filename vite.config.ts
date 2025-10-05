import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { VitePWA } from "vite-plugin-pwa"
import eslint from "vite-plugin-eslint"
import { viteMockServe } from "vite-plugin-mock"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { resolve } from "path"

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const isDev = command === "serve"
  const isProd = command === "build"
  const isWebComponent = mode === 'webc'
  
  return {
    plugins: [
      vue({
        script: {
          defineModel: true,
          propsDestructure: true,
        },
      }),
      vueJsx(),

      // ESLint 插件 (仅在开发环境启用)
      // ...(isDev
      //     ? [
      //       eslint({
      //         include: ["src/**/*.{js,jsx,ts,tsx,vue}"],
      //         exclude: ["node_modules", "dist"],
      //         cache: false,
      //       }),
      //     ]
      //     : []),

      // 自动导入
      AutoImport({
        imports: [
          "vue",
          "vue-router",
          "pinia",
          "@vueuse/core",
          {
            "lodash-es": [
              "debounce",
              "throttle",
              "cloneDeep",
              "merge",
              "pick",
              "omit",
              "groupBy",
              "sortBy",
              "uniq",
              "chunk",
            ],
          },
        ],
        dts: true,
        eslintrc: {
          enabled: true,
        },
      }),

      // 自动导入组件
      Components({
        dirs: ["src/components"],
        extensions: ["vue"],
        deep: true,
        dts: true,
      }),

      // PWA 支持 (webc模式下禁用)
      ...(!isWebComponent ? [VitePWA({
        registerType: "autoUpdate",
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        },
        manifest: {
          name: "多维表格编辑器",
          short_name: "表格编辑器",
          description: "高性能多维表格编辑器，支持虚拟滚动和海量数据处理",
          theme_color: "#3b82f6",
          background_color: "#ffffff",
          display: "standalone",
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      })] : []),

      // Mock 数据服务 (仅在开发环境启用)
      ...(isDev
          ? [
            viteMockServe({
              mockPath: "mock",
              // localEnabled: true,
              // prodEnabled: false,
              // supportTs: true,
              logger: true,
            }),
          ]
          : []),
    ],

    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "~": resolve(__dirname, "src"),
        "#": resolve(__dirname, "types"),
      },
      indexHtml: !isWebComponent ? true : false, // 可选
    },

    // 移除 CSS 配置中的 require，改用独立的 PostCSS 配置文件
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
        },
      },
    },

    server: {
      host: "0.0.0.0",
      port: 3000,
      open: true,
      cors: true,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "http://localhost:8080",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },


    // ...已有plugins、resolve等
    build: isWebComponent
      ? {
            // 禁用默认的 HTML 入口
            rollupOptions: {
              input: 'src/shareview-webcomponent.ts', // ✅ 明确入口
              output: {
                // 可选：自定义输出
                format: 'es'
              }
            },
            lib: {
              entry: 'src/shareview-webcomponent.ts',
              name: 'ShareView',
              formats: ['es'],
              fileName: 'shareview-webcomponent'
            },
            outDir: 'dist-webc', // 建议输出到单独目录
            emptyOutDir: true,
            cssCodeSplit: false,  // 将所有 CSS 打包进一个 style.css 文件
            // 关键：不要让 Vite 寻找 index.html
        }
      :  {
      target: "es2015",
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: isDev,
      minify: isProd ? "terser" : false,

      // 代码分割优化
      rollupOptions: {
        output: {
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]",

          // 手动分包
          manualChunks: {
            // Vue 生态
            "vue-vendor": ["vue", "vue-router", "pinia"],
            // UI 组件库
            "ui-vendor": ["lucide-vue-next"],
            // 工具库
            "utils-vendor": ["lodash-es", "date-fns", "nanoid"],
            // 数据处理
            "data-vendor": ["papaparse", "xlsx", "jszip", "file-saver"],
            // 拖拽排序
            "sortable-vendor": ["sortablejs"],
            // 搜索
            "search-vendor": ["fuse.js"],
          },
        },
      },

      // Terser 压缩配置
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd,
          pure_funcs: isProd ? ["console.log"] : [],
        },
      },

      // 构建优化
      chunkSizeWarningLimit: 1000,
    },

    // 预构建优化
    optimizeDeps: {
      include: [
        "vue",
        "vue-router",
        "pinia",
        "@vueuse/core",
        "lodash-es",
        "date-fns",
        "lucide-vue-next",
        "sortablejs",
        "papaparse",
        "file-saver",
        "jszip",
        "xlsx",
        "fuse.js",
      ],
    },

    // 环境变量
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
      // 兼容 web component 构建，防止 process is not defined
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
        npm_package_version: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      },
    },
  }
})
