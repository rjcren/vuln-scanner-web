<template>
    <div class="container">
        <!-- 报告表格 -->
        <el-table class="card" :data="reportList" stripe style="width: 100%">
            <el-table-column prop="task_name" label="任务名称" width="300" :filters="taskFilters"
                :filter-method="filterHandler" filter-placement="bottom-end" sortable >
            </el-table-column>
            <el-table-column prop="url" label="目标URL" width="400" />
            <el-table-column prop="type" label="报告类型" width="120" align="center" />
            <el-table-column prop="created_at" label="生成时间" width="220" sortable align="center" />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="handleDownload(scope.row.task_id)">
                        下载报告
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDelete(scope.row.report_id)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const reportList = ref([])
const taskFilters = ref([])

// 加载报告列表
const loadReports = async () => {
    try {
        const res = await request.get('/reports/reports')
        reportList.value = res.data.data.map(report => ({
            ...report,
            created_at: new Date(report.created_at).toLocaleString()
        }))

        const taskMap = new Map()
        res.data.data.forEach(item => {
            taskMap.set(item.task_id, {
                text: `${item.task_name} (ID:${item.task_id})`,
                value: item.task_id
            })
        })
        taskFilters.value = Array.from(taskMap.values())
    } catch (error) {
        ElMessage.error('获取报告列表失败')
    }
}

const filterHandler = (value, row) => {
  return row.task_id === value
}

// 文件下载处理
const handleDownload = async (taskId) => {
    try {
        const response = await request.get(`/reports/report/${taskId}`, {
            responseType: 'blob'
        })

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url

        // 从响应头获取文件名
        const fileName = response.headers['content-disposition']
            ?.split('filename=')[1]
            ?.replace(/"/g, '') || `report_${taskId}`

        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    } catch (error) {
        ElMessage.error('下载失败')
    }
}

// 删除报告
const handleDelete = (reportId) => {
    ElMessageBox.confirm('确定删除该报告？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            await request.delete(`/reports/report/${reportId}`)
            ElMessage.success('删除成功')
            loadReports()
        } catch (error) {
            ElMessage.error(error.response?.data?.message || '删除失败')
        }
    })
}

onMounted(() => {
    loadReports()
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
