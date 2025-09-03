import { createRouter, createWebHistory } from "vue-router"
import TableView from "@/views/TableView.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "table",
      component: TableView,
    },
    {
      path: "/kanban",
      name: "kanban",
      component: () => import("@/views/KanbanView.vue"),
    },
    {
      path: "/form",
      name: "form",
      component: () => import("@/views/FormView.vue"),
    },
  ],
})

export default router
