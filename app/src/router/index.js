import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        component: () => import('@/general/Index.vue')
    },
    {
        path: '/inventory/:categoryId?',
        component: () => import('@/general/Inventory.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/loans',
        component: () => import('@/admin/Loans.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/pending',
        component: () => import('@/admin/Pending.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/home',
        component: () => import('@/student/Home.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        component: () => import('@/general/Profile.vue'),
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router