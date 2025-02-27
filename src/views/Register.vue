<template>
    <div class="login">
        <el-image fit="cover" :src="bg"
            style="width: 100%; height: 100%; position: absolute; left: 0; top: 0; object-fit: cover;" />
        <div class="loginPart">
            <h2>用户注册</h2>
            <el-form aria-autocomplete="off" :model="registerForm" :rules="rules" ref="registerFormRef"
                label-width="100px" style="transform: translate(-30px)">
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="registerForm.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>
                <el-form-item label="用户名" prop="name">
                    <el-input v-model="registerForm.name" placeholder="请输入用户昵称" clearable></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input type="password" v-model="registerForm.password" placeholder="请输入密码"
                        show-password></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input type="password" v-model="registerForm.confirmPassword" placeholder="请确认密码"
                        show-password></el-input>
                </el-form-item>
                <el-form-item label="验证码" prop="code">
                    <el-input style="width: 150px" v-model="registerForm.code" placeholder="请输入验证码" maxlength="6"
                        clearable></el-input>
                    <el-button round class="code-btn" type="primary" v-if="isTime"
                        @click="getCode(registerForm.email)">获取验证码</el-button>
                    <el-button round class="code-btn" size="Large" color="#c0c4c3" v-if="!isTime">{{ currentTime
                        }}后重新获取</el-button>
                </el-form-item>
                <el-button class="btn" type="primary" @click="register">注册</el-button>
                <div style="text-align: right; transform: translate(0, 30px)">
                    <el-link type="success" @click="$router.push('/login')">已有账号？去登录</el-link>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import router from '@/router/index.js'
import request from '@/utils/request.js'
import { ElMessage } from "element-plus";
import bg from "@/assets/bg.png";

const registerForm = ref({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    code: "",
});

const registerFormRef = ref(null);

const rules = {
    email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { type: "email", message: "邮箱格式不正确", trigger: ["blur", "change"] },
    ],
    name: [{ required: true, message: "请输入用户昵称", trigger: "blur" }],
    password: [{ required: true, message: "请输入密码", trigger: "blur" }],
    confirmPassword: [
        { required: true, message: "请确认密码", trigger: "blur" },
        {
            validator: (rule, value, callback) => {
                if (value == "") {
                    callback(new Error("请再次输入密码"));
                } else if (value !== registerForm.value.password) {
                    callback(new Error("两次密码不一致"));
                } else {
                    callback();
                }
            },
            trigger: "blur",
        },
    ],
    code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
};

const isTime = ref(true);
const currentTime = ref(10);

const getCode = async () => {
    const isValid = await registerFormRef.value.validateField('email');
    if (!isValid) {
        ElMessage.error("请正确填写邮箱信息");
        return;
    }
    isTime.value = false;
    currentTime.value = 10;
    const email = registerForm.value.email;
    const interval = setInterval(() => {
        currentTime.value--;
        if (currentTime.value === 0) {
            clearInterval(interval);
            isTime.value = !isTime.value;
        }
    }, 1000);
    request.post('/auth/getcaptcha', registerForm.value ).then(response => {
        const res = response.data;
        if (response.status === 200) ElMessage.success(res.message);
        else ElMessage.error(res.error.message);
    });
};

const register = async () => {
    const isValid = await registerFormRef.value.validate();
    if (!isValid) {
        ElMessage.error("请正确填写表单信息");
        return;
    }
    registerForm.value.email = registerForm.value.email.trim();
    registerForm.value.username = registerForm.value.name.trim();
    registerForm.value.password = registerForm.value.password.trim();
    registerForm.value.code = registerForm.value.code.trim();
    request.post('/auth/register', registerForm.value ).then(response => {
        const res = response.data;
        if (response.status === 200) {
            ElMessage.success(res.message+',3秒后自动跳转登录页面');
            setTimeout(() => { location.href = '/login'; }, 3000);
        } else ElMessage.error(res.error.message);
    });
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
    width: 500px;
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

.code-btn {
  transform: translate(20px);
  width: 90px;
  height: 30px;
  font-size: 10px;
}
</style>