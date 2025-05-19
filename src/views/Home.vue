<template>
  <div class="dashboard-container">
    <!-- 顶部统计行 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background:#f56c6c">
              <el-icon>
                <Warning />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">总漏洞数</div>
              <div class="stat-value">{{ totalVulnerabilities }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background:#409eff">
              <el-icon>
                <Clock />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">进行中任务</div>
              <div class="stat-value">{{ runningTasks !== null ? runningTasks : '0' }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background:#e6a23c">
              <el-icon>
                <Histogram />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">高风险漏洞</div>
              <div class="stat-value">{{ highRiskCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background:#67c23a">
              <el-icon>
                <SuccessFilled />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">完成率</div>
              <div class="stat-value">{{ completionRate }}%</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主要图表区 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span class="chart-title">任务状态分布</span>
          </template>
          <div ref="taskStatusChart" style="height: 380px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span class="chart-title">漏洞严重程度分布</span>
          </template>
          <div ref="severityChart" style="height: 380px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时日志 -->
    <el-card class="mt-4">
      <template #header>
        <div class="log-header">
          <span>实时告警</span>
          <el-tag type="danger">最新 {{ latestAlerts.length || 0 }} 条</el-tag>
        </div>
      </template>
      <el-timeline v-if="latestAlerts?.length">
        <el-timeline-item v-for="(alert, index) in latestAlerts" :key="index" :timestamp="formatTime(alert.time)"
          placement="top" :type="map[alert.severity]">
          <el-link type="primary" :underline="false" :href="alert.target_url" target="_blank">
            <el-icon>
              <Link />
            </el-icon>{{ alert.target_url }}&ensp;
          </el-link>
          任务 {{ alert.task_name }}：{{ alert.description }}
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无告警信息" />
    </el-card>
  </div>
</template>

<script setup>// setup语法糖，必备
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'

// 图表实例
const taskStatusChart = ref(null)
const severityChart = ref(null)

// 数据
const totalVulnerabilities = ref(null)
const runningTasks = ref(null)
const highRiskCount = ref(null)
const completionRate = ref(null)
const latestAlerts = ref([])

// 初始化图表
const initCharts = () => {
  const taskChart = echarts.init(taskStatusChart.value)
  const severityChartInst = echarts.init(severityChart.value)

  // 获取数据
  Promise.all([
    request.get('/tasks/status-stats'),
    request.get('/vuls/severity-stats'),
    request.get('/tasks/running-count'),
    request.get('/vuls/high-risk-count')
  ]).then(([statusRes, severityRes, runningRes, highRiskRes]) => {
    // 任务状态默认值
    const statusData = {
      pending: statusRes.data?.pending ?? 0,
      running: statusRes.data?.running ?? 0,
      completed: statusRes.data?.completed ?? 0,
      failed: statusRes.data?.failed ?? 0
    }

    // 漏洞严重程度默认值
    const severityData = {
      critical: severityRes.data?.critical ?? 0,
      high: severityRes.data?.high ?? 0,
      medium: severityRes.data?.medium ?? 0,
      low: severityRes.data?.low ?? 0,
      info: severityRes.data?.info ?? 0
    }

    const options = (datas) => ({
      tooltip: { trigger: 'item' },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        color: ['#e57373', '#ffb74d', '#fff176', '#81c784', '#64b5f6'],
        data: datas.map(item => ({ value: item.value, name: item.name })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }],
      label: {
        alignTo: 'edge',
        formatter: '{name|{b}} {time|{c} 个}',
        minMargin: 5,
        edgeDistance: 10,
        lineHeight: 15,
        rich: {
          time: {
            fontSize: 13,
            color: 'black'
          }
        }
      }
    });

    // 任务状态图表配置
    taskChart.setOption(options([
      { value: statusData.failed, name: '失败' },
      { value: statusData.running, name: '扫描中' },
      { value: statusData.pending, name: '等待中' },
      { value: statusData.completed, name: '已完成' }
    ]))
    // 漏洞严重程度配置
    severityChartInst.setOption(options([
      { value: severityData.critical, name: '严重' },
      { value: severityData.high, name: '高危' },
      { value: severityData.medium, name: '中危' },
      { value: severityData.low, name: '低危' },
      { value: severityData.info, name: '信息性' }
    ]))

    // 进行中任务默认值
    runningTasks.value = runningRes.data?.count ?? 0

    // 高风险漏洞默认值
    highRiskCount.value = highRiskRes.data?.count ?? 0

    // 总漏洞数计算
    totalVulnerabilities.value = Object.values(severityData).reduce((a, b) => a + b, 0) || 0

    // 完成率计算（防止除零错误）
    const totalTasks = Object.values(statusData).reduce((a, b) => a + b, 0)
    completionRate.value = totalTasks > 0
      ? ((statusData.completed / totalTasks) * 100).toFixed(1)
      : 0

    // 设置图表数据...
  }).catch(error => {
    // 设置默认值
    runningTasks.value = 0
    highRiskCount.value = 0
    totalVulnerabilities.value = 0
    completionRate.value = 0

    // 设置空图表
    const options = () => ({
      series: [{
        data: [],
        itemStyle: { color: '#ccc' }
      }],
      graphic: [{
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: '暂无数据',
          fontSize: 16
        }
      }]
    })
    taskChart.setOption(options())
    severityChartInst.setOption(options())
  })

  // 实时告警处理
  request.get('/vuls/latest-alerts')
    .then(res => {
      latestAlerts.value = res.data || []
    })
    .catch(() => {
      latestAlerts.value = []
    })
}

const map = {
  'critical': 'danger',
  'high': 'warning',
  'medium': 'primary',
  'low': 'info'
}

const formatTime = (timestamp) => {
  return timestamp ? new Date(timestamp).toLocaleString() : '--/--/-- --:--'
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', () => {
    echarts.getInstanceByDom(taskStatusChart.value)?.resize()
    echarts.getInstanceByDom(severityChart.value)?.resize()
  })
})
</script>

<style scoped>
.dashboard-container {
  padding: 0 10px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon i {
  color: white;
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-title {
  color: #909399;
  font-size: 14px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-top: 5px;
}

.chart-card {
  margin: 20px 0;
}

.chart-title {
  font-size: 16px;
  font-weight: bold;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-value.loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  width: 60%;
  height: 24px;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>