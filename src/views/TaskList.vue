<template>
    <div style="width: 100%;">
        <div class="card">
            <el-input style="width: 240px; margin-right: 10px;" v-model="data.keyword" placeholder="请输入搜索内容" clearable
                prefix-icon="Search" />
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="warning" @click="handleReset">重置</el-button>
        </div>
        <div class="card">
            <el-button type="primary" @click="createtask">新建任务</el-button>
            <el-button type="warning" @click="handleBatchDelete">批量删除</el-button>
        </div>
        <div class="card">
            <el-table :data="data.tableData" stripe style="width: 100%;" @selection-change="handleSelectionChange" row-key="task_id">
                <el-table-column type="selection" width="55" />
                <el-table-column v-if="role" prop="username" label="创建用户" width="120" />
                <el-table-column prop="task_name" label="任务名" width="120" />
                <el-table-column prop="target_url" label="URL" width="300" />
                <el-table-column prop="scan_type" label="扫描类型" width="100" />
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                        <el-tag :type="statusMap[scope.row.status][0]" style="min-width: 60px;" disable-transitions>{{
                            statusMap[scope.row.status][1] }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="created_at" label="创建时间" width="200" />
                <el-table-column prop="finished_at" label="完成时间" width="200" />
                <el-table-column fixed="right" label="操作" min-width="120">
                    <template #default="scope">
                        <el-button link :disabled="['running', 'completed'].includes(scope.row.status)" type="warning" size="small"
                            @click="startScan(scope.row.task_id)">开始扫描</el-button>
                        <el-button link type="primary" size="small"
                            @click="findMore(scope.row.task_id)">查看详情</el-button>
                        <el-button link :disabled="scope.row.status === 'running'" type="danger" size="small"
                            @click="handleDelete(scope.row.task_id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div style="margin: 15px 20px 0;">
                <el-pagination v-model:current-page="data.currentPage" v-model:page-size="data.pageSize"
                    :page-sizes="[5, 10, 15]" layout="total, sizes, prev, pager, next, jumper" :total="data.total"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </div>
        <!-- 编辑/添加 任务表单 -->
        <el-dialog v-model="dialogVisible" title="新建扫描任务" width="30%">
            <el-form :model="form" label-width="80px">
                <el-form-item label="任务名称" required>
                    <el-input v-model="form.task_name" placeholder="请输入任务名称" />
                </el-form-item>
                <el-form-item label="目标URL" required>
                    <el-input v-model="form.target_url" placeholder="请输入目标URL" />
                </el-form-item>
                <el-form-item label="扫描类型">
                    <el-select v-model="form.scan_type" placeholder="请选择">
                        <el-option label="快速扫描" value="quick" />
                        <el-option label="全盘扫描" value="full" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitTask">立即创建</el-button>
            </template>
        </el-dialog>
    </div>

</template>

<script setup>
import { reactive, onMounted, ref, inject } from "vue";
import { Search } from "@element-plus/icons-vue";
import request from "@/utils/request";
import { fetchCurrentUser } from "@/utils/user";
import { ElMessage, ElMessageBox } from "element-plus";

const addTab = inject('addTab')

const data = reactive({
    keyword: "",
    currentPage: 1,
    pageSize: 10,
    total: 1,
    tastList: [],
});

const statusMap = {
    'pending': ['info', '待执行'],
    'running': ['warning', '执行中'],
    'completed': ['success', '已完成'],
    'failed': ['danger', '失败']
}

// 加载任务数据
const loadTasks = async () => {
    const res = await request.get('/tasks/gettasks', {
        params: {
            page: data.currentPage,
            size: data.pageSize,
            keyword: data.keyword,
        }
    })
    data.tableData = res.data.tasks.map(task => ({
        task_id: task.task_id,
        username: task.username,
        task_name: task.task_name,
        target_url: task.target_url,
        scan_type: task.scan_type,
        status: task.status,
        created_at: task.created_at,
        finished_at: task.finished_at ? task.finished_at : '无'
    }))
    data.total = res.data.total
}

const handleSearch = () => {
    data.currentPage = 1 // 搜索时重置到第一页
    loadTasks()
}

const handleReset = () => {
    data.keyword = ''
    handleSearch()
}

const handleSizeChange = (newSize) => {
    data.pageSize = newSize
    loadTasks()
}

const handleCurrentChange = (newPage) => {
    data.currentPage = newPage
    loadTasks()
}

const dialogVisible = ref(false)
const form = reactive({
    task_name: '',
    target_url: '',
    scan_type: 'quick',
})

const createtask = () => {
    dialogVisible.value = true
}

const submitTask = async () => {
    const res = await request.post('/tasks/createtask', {
        task_name: form.task_name,
        target_url: form.target_url,
        scan_type: form.scan_type,
    })

    ElMessage.success('任务创建成功')
    dialogVisible.value = false
    loadTasks()
    Object.assign(form, {
        task_name: '',
        target_url: '',
        scan_type: 'quick',
    })
}

const findMore = (row) => {
    addTab('/manager/task-detail/' + row)
}

const startScan = (task_id) => {
    ElMessageBox.confirm('请确保已获得目标的授权，确认开始扫描？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        const res = await request.post('/tasks/start', {
            task_id: task_id
        })
        ElMessage.success(res.data.message)
        loadTasks()
    }).catch(() => { })
}

const selectedTasks = ref([])

const handleSelectionChange = (selection) => {
    selectedTasks.value = selection.map(item => item.task_id)
}

const handleDelete = (task_id) => {
    ElMessageBox.confirm('将删除任务以及关联的所有信息？确认删除？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    }
    ).then(async () => {
        const res = await request.post(`/tasks/delete`, {
            task_id: String(task_id)
        })
        ElMessage.success(res.data.message)
        loadTasks()
    }).catch(() => { })
}

const handleBatchDelete = () => {
    if (!selectedTasks.value.length) {
        ElMessage.warning('请选择要删除的任务')
        return
    } ElMessageBox.confirm('将删除任务以及关联的所有信息？确认删除？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        const res = await request.post('/tasks/delete', {
            task_id: selectedTasks.value.join(',')
        })
        ElMessage.success(res.data.message)
        loadTasks()
    }).catch(() => { })
}

const role = ref(false)
// 初始化加载
onMounted( async () =>  {
    loadTasks()
    try {
        const res = await fetchCurrentUser()
        role.value = res.role === 'admin'
    } catch (error) {
        ElMessage.error('获取用户信息失败')
    }
})
</script>

<style scoped>
.card {
    margin-bottom: 5px;
}
</style>
