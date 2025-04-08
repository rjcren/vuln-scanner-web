<template>
    <div style="text-align: center; margin-top: 200px;">
        <div style="width: 100%; font-size: 50px;">
            <div>找不到页面!</div>
            <img src="@/assets/404.png" alt="">
        </div>
        <div>
            <el-button type="primary" style="width: 200px;" size="default" @click="router.replace('/')">返回主页</el-button>
        </div>
    </div>
</template>

<script setup>
    import router from '../../router/index.js'
</script>