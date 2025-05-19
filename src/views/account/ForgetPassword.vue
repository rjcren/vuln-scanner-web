<template>
    <div class="login">
        <el-image fit="cover" :src="bg"
            style="width: 100%; height: 100%; position: absolute; left: 0; top: 0; object-fit: cover;" />
        <div class="loginPart">
            <h2>忘记密码</h2>
            <el-form :model="forgetForm" :rules="rules" ref="forgetFormRef" label-width="100px"
                style="transform: translate(-30px)">
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="forgetForm.email" placeholder="请输入邮箱" clearable></el-input>
                </el-form-item>
                <el-form-item label="验证码" prop="code">
                    <el-input style="width: 150px" v-model="forgetForm.code" placeholder="请输入验证码" maxlength="6"
                        clearable></el-input>
                    <el-button round class="code-btn" type="primary" v-if="isTime"
                        @click="getCode(forgetForm.email)">获取验证码</el-button>
                    <el-button round class="code-btn" size="Large" color="#c0c4c3" v-else>{{ currentTime }}秒后重新获取</el-button>
                </el-form-item>
                <el-form-item label="新密码" prop="password">
                    <el-input type="password" v-model="forgetForm.password" placeholder="请输入新密码" show-password></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input type="password" v-model="forgetForm.confirmPassword" placeholder="请确认新密码" show-password></el-input>
                </el-form-item>
                <el-button class="btn" type="primary" @click="resetPassword">重置密码</el-button>
                <div style="text-align: right; transform: translate(0, 30px)">
                    <el-link type="success" @click="$router.push('/login')">返回登录</el-link>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import request from "@/utils/request.js";
import { ElMessage } from "element-plus";
import bg from "@/assets/bg.png";

const forgetForm = ref({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
});

const forgetFormRef = ref(null);

const rules = {
    email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { type: "email", message: "邮箱格式不正确", trigger: ["blur", "change"] },
    ],
    code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
    password: [{ required: true, message: "请输入新密码", trigger: "blur" }],
    confirmPassword: [
        { required: true, message: "请确认新密码", trigger: "blur" },
        {
            validator: (rule, value, callback) => {
                if (value !== forgetForm.value.password) {
                    callback(new Error("两次密码不一致"));
                } else {
                    callback();
                }
            },
            trigger: "blur",
        },
    ],
};

const isTime = ref(true);
const currentTime = ref(10);

const getCode = async (email) => {
    const isValid = await forgetFormRef.value.validateField("email");
    if (!isValid) {
        ElMessage.error("请正确填写邮箱信息");
        return;
    }
    isTime.value = false;
    currentTime.value = 10;
    const interval = setInterval(() => {
        currentTime.value--;
        if (currentTime.value === 0) {
            clearInterval(interval);
            isTime.value = true;
        }
    }, 1000);
    try {
        const response = await request.post("/auth/getcaptcha", { email });
        ElMessage.success(response.data.message);
    } catch (error) {
        ElMessage.error("验证码发送失败");
    }
};

const resetPassword = async () => {
    const isValid = await forgetFormRef.value.validate();
    if (!isValid) {
        ElMessage.error("请正确填写表单信息");
        return;
    }
    try {
        const response = await request.post("/auth/reset-password", forgetForm.value);
        ElMessage.success(response.data.message + "，3秒后返回登录页面");
        setTimeout(() => {
            location.replace("/login");
        }, 3000);
    } catch (error) {
        ElMessage.error("密码重置失败");
    }
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
    background: #f6f8fa;
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