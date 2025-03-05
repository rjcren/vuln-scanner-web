<template>
    <div>
        <!-- 基本信息卡片 -->
        <el-card class="info-card">
            <h2 class="task-title">
                任务：{{ data.task_name }} &emsp;
                <el-button type="warning" :disabled="data.status !== 'pending'" @click="startScan">开始扫描</el-button>
            </h2>
            <div class="grid-container">
                <!-- 左侧基本信息 -->
                <div class="grid-left">
                    <div class="info-item">
                        <span class="label">任务ID：</span>
                        <el-tag type="info">{{ data.task_id }}</el-tag>
                    </div>
                    <div class="info-item">
                        <span class="label">扫描状态：</span>
                        <el-tag :type="statusMap[data.status]?.[0] || 'info'">{{ statusMap[data.status]?.[1] || '未知'
                            }}</el-tag>
                    </div>
                    <div class="info-item">
                        <span class="label">目标URL：</span>
                        <el-link type="primary" :href="data.target_url" target="_blank">{{ data.target_url }}</el-link>
                    </div>
                    <div class="info-item">
                        <span class="label">创建时间：</span>
                        <el-text type="info">{{ formatTime(data.created_at) }}</el-text>
                    </div>
                    <div class="info-item">
                        <span class="label">完成时间：</span>
                        <el-text type="info">{{ data.finished_at ? formatTime(data.finished_at) : '任务未完成' }}</el-text>
                    </div>
                </div>
                <!-- 右侧详细信息分栏 -->
                <div class="grid-right">
                    <el-descriptions class="detail-section" title="扫描详情" :column="1" border>
                        <el-descriptions-item label="扫描类型">{{ data.scan_type }}</el-descriptions-item>
                        <el-descriptions-item label="漏洞数量">
                            <el-text type="danger">{{ data.vulnerabilities.length }} 个</el-text>
                        </el-descriptions-item>
                        <el-descriptions-item label="漏洞报告">{{ data.risk_reports.length }} 个</el-descriptions-item>
                    </el-descriptions>
                </div>
            </div>
        </el-card>
        <!-- 日志时间线 -->
        <el-card class="log-section">
            <template #header>
                <span class="log-title">任务日志</span>
            </template>
            <el-timeline v-if="data.task_logs.length">
                <el-timeline-item v-for="(log, index) in data.task_logs" :key="index"
                    :timestamp="formatTime(log.timestamp)" placement="top">
                    <span :style="{ color: statusMap[log.log_level] }">{{ log.log_message }}</span>
                </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无日志记录" />
        </el-card>

        <el-card class="vuln-section">
            <template #header>
                <div class="section-header">
                    <span class="section-title">漏洞清单</span>
                    <el-tag type="danger">共 {{ data.vulnerabilities.length }} 个漏洞</el-tag>
                </div>
            </template>

            <el-table :data="data.vulnerabilities" stripe empty-text="未发现漏洞" style="width: 100%">
                <el-table-column prop="cve_id" label="CVE ID" width="140">
                    <template #default="{ row }">
                        <el-link v-if="row.cve_id" type="primary"
                            :href="`https://nvd.nist.gov/vuln/detail/${row.cve_id}`" target="_blank">
                            {{ row.cve_id }}
                        </el-link>
                        <span v-else>-</span>
                    </template>
                </el-table-column>

                <el-table-column prop="severity" label="严重等级" width="120">
                    <template #default="{ row }">
                        <el-tag :type="severityColor(row.severity)" effect="dark">
                            {{ row.severity.toUpperCase() }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="description" label="漏洞描述">
                    <template #default="{ row }">
                        <div class="description-wrapper">
                            {{ truncateDescription(row.description) }}
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="120">
                    <template #default="{ row }">
                        <el-button size="small" @click="showDetail(row)">
                            详情
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script setup>
import { reactive, onMounted, ref, computed } from "vue";
import { Search } from "@element-plus/icons-vue";
import request from "@/utils/request";
import { parsejwt } from "@/utils/user";
import { ElMessage, ElMessageBox } from "element-plus";
import router from "@/router";
import { useRoute } from "vue-router";

const data = reactive({
    task_id: "",
    task_name: "",
    target_url: "",
    scan_type: "",
    status: "",
    created_at: "",
    finished_at: "",
    task_logs: [],
    vulnerabilities: [],
    risk_reports: [],
});

const loadTaskDetail = async () => {
    try {
        const id = useRoute().params.id;
        const res = await request.get(`/tasks/${id}`);
        console.log(res);
        Object.assign(data, res.data)
    } catch (error) {
        console.log('获取任务详情失败', error)
        ElMessage.error('获取任务详情失败')
    }
}

const startScan = () => {
    ElMessageBox.confirm('请确保已获得目标的授权，确认开始扫描？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        const res = await request.post('/tasks/start', {
            task_id: data.task_id
        })
        ElMessage.success(res.data.message)
        loadTaskDetail()
    }).catch(() => { })
}

const statusMap = {
    'pending': ['info', '待执行'],
    'running': ['warning', '执行中'],
    'completed': ['success', '已完成'],
    'failed': ['danger', '失败'],
    'ERROR': 'red',
    'WARNING': 'yellow',
}

const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString()
}

const severityColor = (severity) => {
    const map = {
        'critical': 'danger',
        'high': 'warning',
        'medium': 'primary',
        'low': 'info'
    }
    return map[severity.toLowerCase()] || 'info'
}

const truncateDescription = (desc) => {
    if (!desc) return '-'
    return desc.length > 100 ? desc.substring(0, 100) + '...' : desc
}

const showDetail = (vuln) => {
    ElMessageBox.alert(
        `<div class="vuln-detail">
      <h3>${vuln.cve_id || '未知漏洞'}</h3>
      <p><strong>严重等级：</strong><el-tag type="${severityColor(vuln.severity)}">${vuln.severity}</el-tag></p>
      <p><strong>详细描述：</strong>${vuln.description || '无'}</p>
      <p><strong>解决方案：</strong>${vuln.solution || '暂无解决方案'}</p>
    </div>`,
        {
            title: '漏洞详情',
            dangerouslyUseHTMLString: true,
            customClass: 'detail-modal'
        }
    )
}

onMounted(() => {
    loadTaskDetail()
})
</script>

<style scoped>
.task-container {
    max-width: 1200px;
    margin: 20px auto;
    padding: 20px;
}

.task-title {
    margin-bottom: 30px;
    color: #303133;
}

.info-card {
    margin-bottom: 20px;
    padding: 0 20px;
}

.grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
}

.info-item {
    margin: 12px 0;
    display: flex;
    align-items: center;
}

.label {
    width: 80px;
    color: #606266;
    font-weight: 500;
}

.detail-section {
    margin: 20px 0;
}

.log-section {
    margin-top: 30px;
}

.log-title {
    font-size: 16px;
    font-weight: 600;
}

.vuln-section {
    margin-top: 30px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
}

.description-wrapper {
    line-height: 1.5;
    max-height: 3em;
    overflow: hidden;
    text-overflow: ellipsis;
}

:deep(.detail-modal) {
    width: 60%;
    max-width: 800px;
}

.vuln-detail h3 {
    margin-bottom: 15px;
    color: #303133;
}

.vuln-detail p {
    margin: 10px 0;
    line-height: 1.6;
}
</style>