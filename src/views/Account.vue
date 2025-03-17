<template>
    <div class="account">
        <el-row :gutter="20">
            <el-col :span="6" :xs="24">
                <el-card class="box-card">
                    <template #header>
                        <div class="clearfix">
                            <span>个人信息</span>
                        </div>
                    </template>
                    <div>
                        <ul class="list-group list-group-striped">
                            <li class="list-group-item">
                                <el-icon>
                                    <User />
                                </el-icon>&ensp;用户名称
                                <div class="pull-right">{{ data.username }}</div>
                            </li>
                            <li class="list-group-item">
                                <el-icon>
                                    <Message />
                                </el-icon>&ensp;用户邮箱
                                <div class="pull-right">{{ data.email }}</div>
                            </li>
                            <li class="list-group-item">
                                <el-icon>
                                    <MessageBox />
                                </el-icon>&ensp;所属角色
                                <div class="pull-right">{{ data.role }}</div>
                            </li>
                            <li class="list-group-item">
                                <el-icon>
                                    <Timer />
                                </el-icon>&ensp;创建日期
                                <div class="pull-right">{{ data.created_at }}</div>
                            </li>
                        </ul>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="18" :xs="24">
                <el-card>
                    <template #header>
                        <div class="clearfix">
                            <span>修改信息</span>
                        </div>
                    </template>
                    <el-tabs v-model="activeTab">
                        <el-tab-pane label="基本资料" name="userinfo" style="padding-top: 20px;">
                            <el-form ref="userRef" :model="account" :rules="account_rules" label-width="80px">
                                <el-form-item label="用户昵称" prop="username">
                                    <el-input v-model="account.username" maxlength="30" />
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="handleAccountSubmit">保存</el-button>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                        <el-tab-pane label="修改密码" name="resetPwd" style="padding-top: 20px;">
                            <el-form ref="pwdRef" :model="password" :rules="password_rules" label-width="80px">
                                <el-form-item label="旧密码" prop="old_password">
                                    <el-input v-model="password.old_password" placeholder="请输入旧密码" type="password"
                                        show-password />
                                </el-form-item>
                                <el-form-item label="新密码" prop="new_password">
                                    <el-input v-model="password.new_password" placeholder="请输入新密码" type="password"
                                        show-password />
                                </el-form-item>
                                <el-form-item label="确认密码" prop="confirm_password">
                                    <el-input v-model="password.confirm_password" placeholder="请确认新密码" type="password"
                                        show-password />
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="handlePasswordSubmit">保存</el-button>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                    </el-tabs>
                </el-card>
            </el-col>
        </el-row>
        <el-alert title="安全提示" type="info" :closable="false" description="定期修改密码可有效提升账户安全性，建议每3个月更新一次登录密码" style="margin-top: 40px;">
        </el-alert>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

// 表单引用
const userRef = ref(null)
const pwdRef = ref(null)
const activeTab = ref('userinfo')

// 用户数据
const data = reactive({
    user_id: "",
    email: "",
    username: "",
    role: "",
    created_at: "",
})

// 账号表单数据
const account = reactive({
    username: "",
    email: "",
})

// 密码表单数据
const password = reactive({
    old_password: "",
    new_password: "",
    confirm_password: ""
})

// 验证规则
const account_rules = {
    username: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
    email: [
        { required: true, message: "邮箱地址不能为空", trigger: "blur" },
        { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }
    ]
}

const validateConfirmPassword = (rule, value, callback) => {
    if (value !== password.new_password) {
        callback(new Error("两次输入的密码不一致"))
    } else {
        callback()
    }
}

const password_rules = {
    old_password: [{ required: true, message: "旧密码不能为空", trigger: "blur" }],
    new_password: [
        { required: true, message: "新密码不能为空", trigger: "blur" },
        { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" },
        { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\\ |", trigger: "blur" }
    ],
    confirm_password: [
        { required: true, message: "确认密码不能为空", trigger: "blur" },
        { validator: validateConfirmPassword, trigger: "blur" }
    ]
}

// 获取账户信息
const getAccount = async () => {
    const res = await request.get('/auth/account')
    Object.assign(data, res.data)
    account.username = data.username
    account.email = data.email
}

// 提交账号修改
const handleAccountSubmit = async () => {
    try {
        await userRef.value.validate()
    } catch (error) {
        ElMessage.warning('请正确填写表单')
        return
    }
    await request.post('/auth/change-account', {
        username: account.username
    })
    ElMessage.success('个人信息更新成功')
    getAccount()
}

// 提交密码修改
const handlePasswordSubmit = async () => {
    try {
        await pwdRef.value.validate()
    } catch (error) {
        ElMessage.warning('请正确填写表单')
        return
    }
    await request.post('/auth/change-password', {
        old_password: password.old_password,
        new_password: password.new_password
    })
    ElMessage.success('密码修改成功')
    // 清空密码表单
    Object.assign(password, {
        old_password: '',
        new_password: '',
        confirm_password: ''
    })
}

onMounted(() => {
    getAccount()
})
</script>

<style scoped>
.account {
    margin: 50px;
}

.list-group {
    padding-left: 0px;
    list-style: none;
}

.list-group-item {
    border-bottom: 1px solid #e7eaec;
    border-top: 1px solid #e7eaec;
    margin-bottom: -1px;
    padding: 20px 0px 10px;
    font-size: 13px;
}

svg {
    position: relative;
    top: 2px;
}

.pull-right {
    float: right !important;
}

.clearfix::after {
    visibility: hidden;
    display: block;
    font-size: 0;
    content: " ";
    clear: both;
    height: 0;
}
</style>