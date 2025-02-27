<template>
  <div>
    <div>
      <router-link to="/">home</router-link>&ensp;
      <router-link to="manager/child">test</router-link>
    </div>
    <el-button type="primary"
      @click="router.push({ path: '/manager', query: { id: 1, name: 'test' } })">点击跳转</el-button>

    <div>
      <el-button type="primary" size="default" @click="reg">点击发送post请求</el-button>

    </div>
  </div>
</template>

<script setup>
// setup语法糖，必备
import { ref, reactive } from 'vue'
import router from '@/router/index.js'
import request from '@/utils/request.js'
import { ElMessage } from "element-plus";

const reg = () => {
  ElMessage.error("错误提示");
}

</script>
