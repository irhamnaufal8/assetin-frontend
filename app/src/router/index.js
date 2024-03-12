import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        component: () => import('@/Index.vue')
    },
    {
        path: '/create',
        component: () => import('@/Create.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router