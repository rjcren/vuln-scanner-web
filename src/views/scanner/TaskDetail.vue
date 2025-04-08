<template>
    <div>
        <!-- 基本信息卡片 -->
        <el-card class="info-card">
            <h2 class="task-title">
                任务：{{ data.task_name }} &emsp;
                <el-button type="success" :disabled="['running', 'completed'].includes(data.status)"
                    @click="startScan">开始扫描</el-button>
                <el-button type="warning" :disabled="data.status !== 'running'" @click="stopScan">停止扫描</el-button>
                <el-button type="primary" :disabled="data.status !== 'completed'"
                    @click="generateReport">下载报告</el-button>
                <el-button type="primary" @click="openFeedbackDialog">提交反馈</el-button>
            </h2>
            <div class="grid-container">
                <!-- 左侧基本信息 -->
                <div class="grid-item">
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

                <div class="grid-item">
                    <el-form-item label="自动登录">
                        <el-switch v-model="haslogin" readonly />
                    </el-form-item>
                    <div v-if="data.login_info">
                        <el-form-item label="登录地址">
                            <el-input v-model="data.login_info[0]" readonly />
                        </el-form-item>
                        <el-form-item label="&emsp;用户名">
                            <el-input v-model="data.login_info[1]" readonly />
                        </el-form-item>
                        <el-form-item label="&emsp;密&emsp;码">
                            <el-input type="password" v-model="data.login_info[2]" readonly />
                        </el-form-item>
                    </div>
                </div>

                <!-- 右侧详细信息分栏 -->
                <div class="grid-item">
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
        <div class="log-vuln-container">
            <!-- 日志时间线 -->
            <el-card class="log-section">
                <template #header>
                    <div class="section-header">
                        <span class="log-title">任务日志</span>
                    </div>
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
                    <el-table-column prop="vul_type" label="漏洞类型" width="350">
                        <template #default="{ row }">{{ row.vul_type }}</template>
                    </el-table-column>

                    <el-table-column prop="severity" label="严重等级" width="160" align="center" :filters="[
                        { text: 'CRITICAL', value: 'critical' },
                        { text: 'HIGH', value: 'high' },
                        { text: 'MEDIUM', value: 'medium' },
                        { text: 'LOW', value: 'low' },
                        { text: 'INFO', value: 'info' }
                    ]" :filter-method="filterSeverity" sortable>
                        <template #default="{ row }">
                            <el-tag :style="{ backgroundColor: severityMap[row.severity][0], border: 'none' }"
                                effect="dark">
                                {{ severityMap[row.severity][1] }}
                            </el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column prop="severity" label="漏洞来源" width="200" align="center"
                        :filters="[{ text: 'AWVS', value: 'AWVS' }]" :filter-method="filterSource" sortable>
                        <template #default="{ row }">
                            <el-tag :type="'info'">
                                {{ row.scan_source.toUpperCase() }}
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

                    <el-table-column label="操作" width="150" align="center">
                        <template #default="{ row }">
                            <el-button size="small" @click="showDetail(row)">
                                详情
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </div>
        <el-dialog v-model="showReportDialog" title="选择报告类型" width="30%">
            <el-select v-model="reportFormat" placeholder="请选择报告类型" style="width: 100%">
                <el-option label="PDF" value="pdf" />
                <el-option label="HTML" value="html" />
            </el-select>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showReportDialog = false">取消</el-button>
                    <el-button type="primary" @click="handleReportConfirm">确定</el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog v-model="showFeedbackDialog" title="提交反馈" width="30%">
            <el-form :model="feedbackForm">
                <el-form-item label="反馈内容" required>
                    <el-input type="textarea" v-model="feedbackForm.description" placeholder="请输入反馈内容" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showFeedbackDialog = false">取消</el-button>
                <el-button type="primary" @click="submitFeedback">提交</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, ref, computed, onUnmounted } from "vue";
import { Search } from "@element-plus/icons-vue";
import request from "@/utils/request";
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
    login: [],
    task_logs: [],
    vulnerabilities: [],
    risk_reports: [],
});

const haslogin = computed(() => {
    return data.login_info && data.login_info.length === 3
})

const loadTaskDetail = async () => {
    try {
        const id = data.task_id || useRoute().params.id;
        const res = await request.get(`/tasks/${id}`);
        Object.assign(data, res.data)

        pollingTaskDetail()
    } catch (error) {
        ElMessage.error('获取任务详情失败')
    }
}

// 定时器
let refreshTimer = null
const pollingTaskDetail = async () => {
    // 任务运行状态时轮询
    if (data.status === 'running' && !refreshTimer) {
        refreshTimer = setInterval(async () => {
            loadTaskDetail()
        }, 5000)
    } else if (data.status !== 'running' && refreshTimer) {
        clearInterval(refreshTimer)
        refreshTimer = null
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
    }).catch(() => { loadTaskDetail() })
}

const stopScan = () => {
    ElMessageBox.confirm('确认停止扫描？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        const res = await request.post('/tasks/stop', {
            task_id: data.task_id
        })
        ElMessage.success(res.data.message)
        loadTaskDetail()
    }).catch(() => { loadTaskDetail() })
}

const showReportDialog = ref(false);
const reportFormat = ref("pdf");
const generateReport = () => {
    showReportDialog.value = true;
}
const handleReportConfirm = async () => {
    showReportDialog.value = false;
    const response = await request.post("/reports/report", {
        task_id: data.task_id,
        format: reportFormat.value
    }, { responseType: "blob" }
    );
    if (response.status === 200) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        const fileName = response.headers['content-disposition']
            ?.split('filename=')[1]
            ?.replace(/"/g, '') || `report_${taskId}`
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        ElMessage.success("报告下载成功");
    }
};

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

const severityMap = {
    critical: ['#8A3A3F', '严重'],
    high: ['#D94F4F', '高危'],
    medium: ['#D6603D', '中危'],
    low: ['#C07535', '低危'],
    info: ['#505997', '信息']
}

const truncateDescription = (desc) => {
    if (!desc) return '-'
    return desc.length > 100 ? desc.substring(0, 100) + '...' : desc
}

const showDetail = (vuln) => {
    ElMessageBox.alert(
        `<div class="vuln-detail">
            <h3>${vuln.vul_type || '未知漏洞'}</h3>
            <p><strong>时间：</strong>${formatTime(vuln.time)}</p>
            <p><strong>严重等级：</strong><el-tag style="background-color: ${severityMap[vuln.severity][0]} border: none">${vuln.severity}</el-tag></p>
            <p><strong>漏洞来源：</strong>${vuln.scan_source || '未知'}</p>
            <p><strong>攻击详情：</strong>${vuln.details || '无'}</p>
            <p><strong>详细描述：</strong>${vuln.description || '无'}</p>
            <p><strong>解决方案：</strong>${vuln.solution || '暂无解决方案'}</p>
        </div>`,
        {
            title: '漏洞详情',
            dangerouslyUseHTMLString: true,
            customStyle: {
                width: '1200px',  // 直接设置宽度
                maxWidth: '90vw' // 响应式最大宽度
            }
        }
    )
}

// 用户反馈
const showFeedbackDialog = ref(false);
const feedbackForm = ref({
  task_id: data.task_id,
  description: "",
});

const openFeedbackDialog = () => {
  feedbackForm.value.description = "";
  showFeedbackDialog.value = true;
};

const submitFeedback = async () => {
  try {
    feedbackForm.value.task_id = data.task_id;
    if (!feedbackForm.value.description) {
      ElMessage.error("反馈内容不能为空");
      return;
    }
    await request.post("/feedback", feedbackForm.value);
    ElMessage.success("反馈提交成功");
    showFeedbackDialog.value = false;
  } catch (error) {
    ElMessage.error("反馈提交失败");
  }
};

const filterSeverity = (value, row) => {
    return row.severity === value;
};

const filterSource = (value, row) => {
    return row.scan_source === value;
};

onMounted(() => {
    loadTaskDetail()
})

onUnmounted(() => {
    if (refreshTimer) {
        clearInterval(refreshTimer)
        refreshTimer = null
    }
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
    grid-template-columns: 3fr 3fr 5fr;
    gap: 10px;
}

.grid-item {
    margin: 0 20px;
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
    margin: 20px 20px;
}

.log-vuln-container {
    display: grid;
    grid-template-columns: 1fr 4fr;
    /* 左右宽度1:4 */
    gap: 20px;
    margin-top: 30px;
}

.log-section,
.vuln-section {
    margin-top: 0 !important;
    min-height: 300px;
    max-height: 650px;
    overflow-y: auto;
    margin-top: 30px;
    position: relative;
}

.el-timeline {
    max-height: 600px;
    overflow-y: auto;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-title,
.log-title {
    font-size: 16px;
    font-weight: 600;
}

.description-wrapper {
    line-height: 1.5;
    max-height: 3em;
    overflow: hidden;
    text-overflow: ellipsis;
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