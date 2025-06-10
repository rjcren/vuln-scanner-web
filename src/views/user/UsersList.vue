<template>
    <div class="container">
        <!-- 操作栏 -->
        <div class="card">
            <el-input v-model="keyword" placeholder="搜索用户名/邮箱" style="width: 300px;" clearable>
                <template #prefix>
                    <el-icon>
                        <search />
                    </el-icon>
                </template>
            </el-input>
            &ensp;<el-button type="primary" @click="handleSearch">查询</el-button>
            &ensp;<el-button type="warning" @click="handleReset">重置</el-button>
            &ensp;<el-button type="primary" @click="showAddDialog">添加用户</el-button>
        </div>

        <!-- 用户表格 -->
        <el-table class="card" :data="userList" stripe style="width: 100%">
            <el-table-column prop="email" label="邮箱" width="400" />
            <el-table-column prop="username" label="用户名" width="170" />
            <el-table-column prop="role" label="角色" width="120" sortable>
                <template #default="scope">
                    {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
                </template>
            </el-table-column>
            <el-table-column prop="created_at" label="注册时间" width="200" sortable />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button type="success" size="small" @click="handleEdit(scope.row)">
                        修改信息
                    </el-button>
                    <el-button type="info" size="small" @click="handleResetPassword(scope.row.user_id)">
                        重置密码
                    </el-button>
                    <el-button type="danger" size="small" :disabled="scope.row.user_id === 1"
                        @click="handleDelete(scope.row.user_id)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加用户对话框 -->
        <el-dialog v-model="dialogVisible" title="新增用户" width="30%">
            <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="80px">
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input type="password" v-model="addForm.password" show-password placeholder="请输入密码" />
                </el-form-item>
                <el-form-item label="角色" prop="role">
                    <el-select v-model="addForm.role">
                        <el-option label="普通用户" value="user" />
                        <el-option label="管理员" value="admin" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleAdd">确定</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="editDialogVisible" title="修改用户信息" width="30%">
            <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="80px">
                <el-form-item style="display: none;" label="">
                    <el-input v-model="editForm.user_id"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="editForm.username" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="角色" prop="role">
                    <el-select v-model="editForm.role">
                        <el-option label="普通用户" value="user" />
                        <el-option label="管理员" value="admin" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleEditSubmit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

// 用户数据
const userList = ref([])
const dialogVisible = ref(false)

// 表单数据
const keyword = ref('')
const addForm = ref({
    email: '',
    username: '',
    password: '',
    role: 'user'
})

// 表单验证规则
const rules = {
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
    ],
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少6位', trigger: 'blur' }
    ]
}

// 加载用户列表
const loadUsers = async () => {
    try {
        const res = await request.get('/auth/get-users', {
            params: {
                keyword: keyword.value
            }
        })
        userList.value = res.data.users.map(user => ({
            ...user,
            created_at: new Date(user.created_at).toLocaleString()
        }))
    } catch (error) {
        ElMessage.error('获取用户列表失败')
    }
}

// 删除用户
const handleDelete = (userId) => {
    ElMessageBox.confirm('确定删除该用户吗？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            const res = await request.delete(`/auth/users/${userId}`)
            ElMessage.success(res.data.message)
            loadUsers()
        } catch (error) {
            ElMessage.error('删除失败')
        }
    })
}

const showAddDialog = () => {
    dialogVisible.value = true
}

const handleSearch = () => {
    loadUsers()
}

const handleReset = () => {
    keyword.value = ''
    handleSearch()
}

// 添加用户
const addFormRef = ref(null)
const handleAdd = async () => {
    try {
        await addFormRef.value.validate()
        const formData = {
            ...addForm.value,
            email: addForm.value.email.trim(),
            username: addForm.value.username.trim()
        }

        await request.post('/auth/add-admin', formData)
        ElMessage.success('用户添加成功')
        dialogVisible.value = false
        loadUsers()
        addFormRef.value.resetFields()
    } catch (error) {
        if (error.response?.data?.message) {
            ElMessage.error(error.response.data.message)
        }
    }
}

const editDialogVisible = ref(false)
const currentUserId = ref(null)

const editForm = ref({
    user_id: null,
    email: '',
    username: '',
    role: 'user'
})

const handleEdit = (row) => {
    currentUserId.value = row.user_id
    editForm.value = {
        user_id: row.user_id,
        email: row.email,
        username: row.username,
        role: row.role
    }
    editDialogVisible.value = true
}

const handleEditSubmit = async () => {
    try {
        await request.post(`/auth/admin-change-info`, editForm.value)
        ElMessage.success('用户信息修改成功')
        editDialogVisible.value = false
        loadUsers()
    } catch (error) {
        ElMessage.error(error.response?.data?.message || '修改失败')
    }
}

const handleResetPassword = (userId) => {
    ElMessageBox.confirm('确定重置该用户密码吗，重置后密码默认为邮箱名？', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
    }).then(async () => {
        try {
            const res = await request.get(`/auth/admin-restart-password/${userId}`)
            ElMessage.success(res.data.message)
            loadUsers()
        } catch (error) {
            ElMessage.error('重置失败')
        }
    })
}

onMounted(async () => {
    loadUsers()
})
</script>

<style scoped>
.container {
    padding: 0;
}

.card {
    margin-bottom: 20px;
}
</style>
