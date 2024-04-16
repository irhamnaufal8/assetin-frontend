import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        component: () => import('@/Index.vue')
    },
    {
        path: '/dashboard',
        component: () => import('@/admin/Dashboard.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/home',
        component: () => import('@/student/Home.vue'),
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router