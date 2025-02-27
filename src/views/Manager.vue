<template>
  <div>
    <!-- 头部 -->
    <div class="header">
      <div class="name">
        <img style="height: 40px;" src="@/assets/logo.png" alt="logo">
        <span>漏洞扫描系统</span>
      </div>
      <div style="flex: 1;"></div>
      <el-dropdown style="margin-right: 20px; color: black;">
        <span class="el-dropdown-link">
          你好！{{ role }} : {{ userName }}
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>账号信息</el-dropdown-item>
            <el-dropdown-item @click="logOut">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <!-- 正文 -->
    <div style="display: flex; min-width: 900px;">
      <!-- 导航菜单 -->
      <div class="navbar">
        <el-menu router :default-active="router.currentRoute.value.path" defauit-active="$router.path"
          class="el-menu-vertical-demo" :default-openeds="['manager']">
          <el-menu-item index="/manager/home">
            <el-icon><icon-menu /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-sub-menu index="manager">
            <template #title>
              <el-icon>
                <location />
              </el-icon>
              <span>漏洞扫描</span>
            </template>
            <el-menu-item index="/manager/task-list">
              <el-icon>
                <list />
              </el-icon>
              任务列表
            </el-menu-item>
            <el-menu-item-group title="Group Two">
              <el-sub-menu index="1-4">
                <template #title>item four</template>
                <el-menu-item index="1-4-1">item one</el-menu-item>
              </el-sub-menu>
            </el-menu-item-group>
          </el-sub-menu>
        </el-menu>
      </div>
      <!-- 主体区域 -->
      <div class="body">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import router from "@/router/index.js";
import { ref, onMounted } from "vue";
import request from "@/utils/request.js";
import { Menu as IconMenu } from '@element-plus/icons-vue';
import { checkLogin, parsejwt, logout } from "@/utils/user.js";
import { ElMessage } from "element-plus";

const userName = ref('');
const role = ref('');

onMounted(async () => {
  // 先进行登录验证
  if (!checkLogin()) return

  // 原有获取用户信息逻辑
  try {
    const res = parsejwt(localStorage.getItem('jwt_token'))
    console.log(res)
    userName.value = res.username
    role.value = res.role === 'admin' ? '管理员' : '普通用户'

  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
    userName.value = '用户'
  }
})

const logOut = () => {
  logout()
  ElMessage.success('退出登录成功')

}
</script>

<style scoped>
.header {
  height: 60px;
  background: linear-gradient(135deg, #409EFF 0%, #3375ff 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 900px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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

.header .el-dropdown-link {
  cursor: pointer;
  color: white !important;
  display: flex;
  align-items: center;
}

.header .el-dropdown-link:hover {
  text-decoration-line: underline;
}

.navbar {
  width: 220px;
  height: calc(100vh - 60px);
  min-height: calc(100vh - 60px);
  border-right: 1px solid #DEE4E9;
}

.el-menu .is-active {
  background-color: #deedff;
}

.body {
  flex: 1;
  padding: 10px;
  width: 0;
}
</style>