import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '', redirect: '/manager/home' },
    { path: '/login', name: 'login', meta: { title: '登录' }, component: () => import('@/views/account/Login.vue') },
    { path: '/register', name: 'register', meta: { title: '注册' }, component: () => import('@/views/account/Register.vue') },
    { path: '/forget', name: 'forget', meta: { title: '忘记密码' }, component: () => import('@/views/account/ForgetPassword.vue') },
    { path: '/force-reset', name: 'ForceReset', meta: { title: '重设信息', requiresAuth: true }, component: () => import('@/views/account/ForceReset.vue') },
    { path: '/manager', meta: { title: '管理' }, component: () => import('@/views/other/base.vue'), children: [
        { path: '', redirect: '/manager/home', meta: { title: '首页' } },
        { path: 'home', name: 'home', meta: { title: '首页' }, component: () => import('@/views/Home.vue') },
        { path: 'account', name: 'account', meta: { title: '账户详情' }, component: () => import('@/views/account/Account.vue') },
        { path: 'task-list', name: 'task-list', meta: { title: '任务管理' }, component: () => import('@/views/scanner/TaskList.vue') },
        { path: 'task-detail/:id', name: 'task-detail', meta: { title: '任务详情' }, component: () => import('@/views/scanner/TaskDetail.vue') },
        { path: 'vul-list', name: 'vul-list', meta: { title: '漏洞管理' }, component: () => import('@/views/vuln/VulnList.vue') },
        { path: 'users-list', name: 'users-list', meta: { title: '用户管理' }, component: () => import('@/views/user/UsersList.vue') },
        { path: 'report-list', name: 'report-list', meta: { title: '报告管理' }, component: () => import('@/views/report/ReportList.vue') },
        { path: 'feedback-list', name: 'feedback-list', meta: { title: '用户反馈列表' }, component: () => import('@/views/scanner/FeedBackList.vue') },
      ]
    },

    { path: '/404', name: 'notFound', meta: { title: '404找不到页面' }, component: () => import('@/views/other/404.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/404' },
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  next()
})

export default router
