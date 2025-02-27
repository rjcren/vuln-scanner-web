<template>
    <div class="login">
        <el-image fit="cover" :src="bg"
            style="width: 100%; height: 100%; position: absolute; left: 0; top: 0; object-fit: cover;" />

        <div class="loginPart">
            <h2>用户登录</h2>
            <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="100px"
                style="transform: translate(-30px)">
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="loginForm.email" placeholder="请输入邮箱" clearable></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" show-password
                        clearable></el-input>
                </el-form-item>

                <el-button class="btn" type="primary" @click="login" auto-insert-space
                    @keyup.enter="login">登录</el-button>
                <div style="text-align: right; transform: translate(0, 30px)">
                    <el-link type="danger" @click="$router.push('/forget')" style="margin-right: 140px">
                        忘记密码？
                    </el-link>
                    <el-link type="warning" @click="$router.push('/register')">没有账号？去注册</el-link>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import router from '@/router/index.js'
import request from '@/utils/request.js'
import { ElMessage } from "element-plus";
import bg from "@/assets/bg.png";

const loginForm = ref({
    email: "",
    password: "",
});

const loginFormRef = ref(null);

const rules = {
    email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { type: "email", message: "邮箱格式不正确", trigger: ["blur", "change"] },
    ],
    password: [{
        required: true,
        message: "请输入密码",
        trigger: "blur",
    }],
};

const login = async () => {
    try {
        await loginFormRef.value.validate();
    } catch (error) {
        ElMessage.error(error);
    }
    loginForm.value.email = loginForm.value.email.trim();
    loginForm.value.password = loginForm.value.password.trim();
    request.post('/auth/login', loginForm.value).then(response => {
        const res = response.data;
        if (response.status === 200) {
            const token = res.token;
            const expires_in = res.expires_in;
            localStorage.setItem('jwt_token', token);
            localStorage.setItem('token_expiration', Date.now() + expires_in * 1000);
            request.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            ElMessage.success(res.message + '，2秒后自动跳转首页');
            setTimeout(() => { location.href = '/manager/home'; }, 2000);
        } else {
            ElMessage.error(res.error.message);
        }
    })
};

</script>

<style scoped>
.login {
    height: calc(100vh);
    width: calc(100vw);
    position: relative;
}

.loginPart {
    position: absolute;
    top: 50%;
    left: 30%;
    transform: translate(-50%, -50%);
    width: 450px;
    padding: 50px;
    background: #F6F8FA;
    box-sizing: border-box;
    box-shadow: 0px 15px 25px rgba(0, 0, 0, 0.5);
    border-radius: 15px;
}

h2 {
    margin: 0 0 30px;
    padding: 0;
    color: black;
    text-align: center;
}

.btn {
    transform: translate(170px);
    width: 80px;
    height: 40px;
    font-size: 15px;
}
</style>