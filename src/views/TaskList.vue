<template>
    <div style="width: 100%;">
        <div class="card">
            <el-input style="width: 240px; margin-right: 10px;" v-model="date.message" placeholder="请输入搜索内容" size="normal"
                clearable prefix-icon="Search"></el-input>
            <el-button type="primary">查询</el-button>
            <el-button type="warning">重置</el-button>
        </div>
        <div class="card">
            <el-button type="primary">新建任务</el-button>
            <el-button type="warning">批量删除</el-button>
        </div>
        <div class="card">
            <el-table :data="date.tableData" stripe style="width: 100%">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="ID" width="100" />
                <el-table-column prop="target_url" label="URL" width="300" />
                <el-table-column prop="status" label="状态" width="100" >
                    <template #default="{ row }">
                    <span :class="`status-${row.statusType}`">{{ row.status }}</span>
                </template>
                </el-table-column>
                <el-table-column prop="created_at" label="创建时间" width="200" />
                <el-table-column prop="finished_at" label="完成时间" width="200" />
                <el-table-column fixed="right" label="操作" min-width="120">
                    <template #default>
                        <el-button link type="primary" size="small" @click="handleClick">
                        Detail
                        </el-button>
                        <el-button link type="primary" size="small">Edit</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div style="margin: 15px 20px 0;">
                <el-pagination
                    v-model:current-page="date.currentPage"
                    v-model:page-size="date.pageSize"
                    :page-sizes="[5, 10, 15, 20]"
                    :size="size"
                    :disabled="disabled"
                    :background="background"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="date.total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
import request from "@/utils/request";

const date = reactive({
    message: "",
    currentPage: 1,
    pageSize: 10,
    total: 1,
    tastList: [],
});

// 加载任务数据
const loadTasks = async () => {
    try {
        const res = await request.get('/tasks/gettasks', {
            params: {
                page: date.currentPage,
                size: date.pageSize
            }
        })
        console.log('获取任务成功:', res)
        const stamap = {
            'pending': '等待开始',
            'running': '扫描中',
            'completed': '完成',
            'failed': '失败'
        }
        date.tableData = res.data.tasks.map(task => ({
            id: task.task_id,
            target_url: task.target_url,
            status: stamap[task.status],
            statusType: task.status,
            created_at: task.created_at,
            finished_at: task.finished_at ? task.finished_at : '无'
        }))
        date.total = res.data.total
    } catch (error) {
        console.error('获取任务失败:', error)
    }
}

// 分页事件处理
const handleSizeChange = (newSize) => {
    date.pageSize = newSize
    loadTasks()
}

const handleCurrentChange = (newPage) => {
    date.currentPage = newPage
    loadTasks()
}

// 初始化加载
onMounted(() => {
    loadTasks()
})
</script>

<style scoped>
.card {
    margin-bottom: 5px;
}

.status-pending {
  color: var(--el-text-color-secondary);  /* 灰色 */
}
.status-running {
  color: var(--el-color-warning);        /* 橙色 */
}
.status-completed {
  color: var(--el-color-success);        /* 绿色 */
}
.status-failed {
  color: var(--el-color-danger);         /* 红色 */
}
</style>
