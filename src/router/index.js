import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '', redirect: '/manager/home' },
    { path: '/login', name: 'login', meta: { title: '登录' }, component: () => import('@/views/Login.vue') },
    { path: '/register', name:'register', meta: { title: '注册' }, component: () => import('@/views/Register.vue') },
    { path: '/manager', name: 'manager', meta: { title: '管理' }, component: () => import('@/views/Manager.vue'), children: [
      { path: '', redirect: '/manager/home' },
      { path: 'home', name: 'home', meta: { title: '首页' }, component: () => import('@/views/Home.vue') },
      { path: 'task-list', name: 'task-list', meta: { title: '任务管理' }, component: () => import('@/views/TaskList.vue') },
    ]},

    { path: '/404', name: 'notFound', meta: { title: '404找不到页面' }, component: () => import('@/views/404.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/404' },
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  next()
})

export default router
