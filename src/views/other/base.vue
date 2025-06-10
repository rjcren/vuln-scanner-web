<template>
  <div class="manager-container">
    <!-- 头部 -->
    <div class="header">
      <div class="name">
        <img style="height: 40px;" src="@/assets/logo.png" alt="logo">
        <span>漏洞扫描系统</span>
      </div>
      <div style="flex: 1;"></div>
      <div style="margin-right: 40px; color: white;">
        <span class="account" @click="$router.push('/manager/account')">你好！{{ role }}：{{ userName }}</span>
      </div>
    </div>
    <!-- 正文 -->
    <div class="main-container">
      <!-- 导航菜单 -->
      <div class="navbar">
        <el-menu router :default-active="router.currentRoute.value.path" defauit-active="$router.path"
          class="el-menu-vertical-demo" :default-openeds="['manager', 'scanner', 'account']">
          <el-menu-item index="home">
            <el-icon><icon-menu /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>

          <el-sub-menu index="scanner">
            <template #title>
              <el-icon>
                <location />
              </el-icon>
              <span>漏洞扫描</span>
            </template>
            <el-menu-item index="/manager/task-list">
              <el-icon>
                <list />
              </el-icon>任务列表
            </el-menu-item>
            <el-menu-item index="/manager/vul-list">
              <el-icon>
                <Management />
              </el-icon>漏洞列表
            </el-menu-item>
            <el-menu-item index="/manager/report-list">
              <el-icon>
                <el-icon><Tickets /></el-icon>
              </el-icon>报告列表
            </el-menu-item>
            <el-menu-item v-if="role === '管理员'" index="/manager/feedback-list">
              <el-icon><ChatDotRound /></el-icon>用户反馈列表
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item v-if="role === '管理员'" index="/manager/users-list">
            <el-icon><Discount /></el-icon>用户管理
          </el-menu-item>

          <el-sub-menu index="account">
            <template #title>
              <el-icon><User /></el-icon>
              <span>账号管理</span>
            </template>
            <el-menu-item index="/manager/account">
              <el-icon><Comment /></el-icon>账号信息
            </el-menu-item>
            <el-menu-item index="" @click="logOut">
              <el-icon><CircleClose /></el-icon>退出登录
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
      <!-- 主体区域 -->
      <div class="body">
        <!-- 标签栏 -->
        <div class="tags-container">
          <el-tabs v-model="activeTab" type="card" closable :key="tabs.length" @tab-remove="removeTab" @tab-click="clickTab">
            <el-tab-pane v-for="tab in tabs" :key="tab.path" :name="tab.path" :label="tab.title" :closable="tab.path !== '/manager/home'"></el-tab-pane>
          </el-tabs>
        </div>
        <!-- 路由视图 -->
        <router-view />
      </div>
    </div>
    <!-- 底部版权信息 -->
    <div class="footer">
      Copyright &copy; 2024 漏洞扫描系统. All Rights Reserved.
      <span style="margin-left: 20px;">版本号：v0.0.1</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, provide } from "vue";
import router from "@/router/index.js";
import { Menu as IconMenu } from '@element-plus/icons-vue';
import { logout, fetchCurrentUser, checkLogin } from "@/utils/user.js";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";

const userName = ref('');
const role = ref('');

onMounted(async () => {
  checkLogin()
  if (tabs.value.length === 0) addTab('/manager/home')

  // 设置首页路由
  if (route.path === '/manager') router.replace('/manager/home')
  activeTab.value = route.path

  // 获取用户信息逻辑
  try {
    const res = await fetchCurrentUser();
    userName.value = res.username
    role.value = res.role === 'admin' ? '管理员' : '普通用户'

  } catch (error) {
    userName.value = '用户'
  }
})

const logOut = () => {
  logout()
  tabs.value = []
  saveTabs()
  ElMessage.success('退出登录成功')
}

const route = useRoute()

// 标签页数据
const tabs = ref(JSON.parse(localStorage.getItem('routeTabs')) || [])
// 当前激活的标签
const activeTab = ref('')

// 保存标签状态
const saveTabs = () => {
  localStorage.setItem('routeTabs', JSON.stringify(tabs.value))
}

const addTab = (path) => {
  const existingTab = tabs.value.find(tab => tab.path === path)
  if (!existingTab) {
    const newRoute = router.resolve(path)
    tabs.value.push({
      title: newRoute.meta.title,
      path: newRoute.path,
    })
    activeTab.value = route.path
    saveTabs()
    router.push(path)
  } else router.push(path)
}

// 监听路由变化
watch(() => route.path, (newPath) => {
  addTab(newPath)
  activeTab.value = newPath
})

// 移除标签
const removeTab = (targetPath) => {
  if (tabs.value.length === 1) {
    ElMessage.warning('至少保留一个标签页')
    return
  }
  const index = tabs.value.findIndex(tab => tab.path === targetPath)
  tabs.value.splice(index, 1)
  // 如果删除的是当前标签
  if (targetPath === route.path) {
    const lastTab = tabs.value[tabs.value.length - 1]
    router.push(lastTab?.path || '/manager/home')
  }
  saveTabs()
}

// 点击标签切换路由
const clickTab = (tab) => {
  router.push(tab.props.name)
}

provide('addTab', addTab)
</script>

<style scoped>

.header {
  height: 60px;
  background: linear-gradient(135deg, #409EFF 0%, #3375ff 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: fixed;
  top: 0;
  z-index: 1005;
  width: 100%;
  left: 0;
  right: 0;
}

.main-container {
  min-width: 1650px;
  display: flex;
  margin: 60px auto 50px;
  height: calc(100vh - 110px); /* 总高度 - header和footer */
  overflow: hidden; /* 禁止外层滚动 */
}

.header .name {
  width: 250px;
  margin: 0 20px;
  display: flex;
  align-items: center;
  font-size: 20px;
  color: #000000;
  font-weight: 500;
}

.header .account {
  cursor: pointer;
}

.header .account:hover {
  text-decoration-line: underline;
}

.navbar {
  width: 200px;
  border-right: 1px solid #DEE4E9;
  position: fixed;
  left: 0;
  height: calc(100vh - 110px);
  z-index: 1005;
  background-color: white;
}

.el-menu .is-active {
  background-color: #deedff;
}

.body {
  flex: 1;
  padding:  10px 20px;
  width: 0;
  margin-left: 200px;
  height: 100%;
  overflow: auto;
}

.tags-container {
  background: #fff;
  margin: 8px 0 20px;
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__item) {
  height: 32px;
  line-height: 32px;
  font-size: 12px;
}

:deep(.el-tabs__nav-wrap)::after {
  height: 1px;
}

/* 路由视图添加滚动 */
:deep(.body > div:last-child) {
  height: calc(100% - 90px); /* 减去标签栏和footer高度 */
  overflow-y: auto;
}

.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: linear-gradient(135deg, #409EFF 0%, #3474ff 100%);
  color: white;
  text-align: center;
  z-index: 1005;
}
</style>