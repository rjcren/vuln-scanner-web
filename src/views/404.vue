<template>
    <div style="text-align: center; padding: 100px;">
        <div style="width: 100%; height: 300px; line-height: 300px; font-size: 50px;">找不到页面！</div>
        <div>
            <el-button type="primary" style="width: 200px;" size="default" @click="router.replace('/')">返回主页</el-button>
        </div>
    </div>
</template>

<script setup>
    import router from '../router/index.js'
</script>