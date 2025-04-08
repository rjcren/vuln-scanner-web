<template>
    <div>
        <div class="card">
            <el-input v-model="data.keyword" placeholder="可搜索漏洞类型" style="width: 300px; margin-right: 20px;"
                clearable />
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="warning" @click="handleReset">重置</el-button>
        </div>

        <div class="card">
            <el-table :data="data.tableData" stripe style="width: 100%" row-key="vul_id" @sort-change="handleSortChange"
                @filter-change="handleFilterChange">
                <el-table-column prop="test_id" label="关联任务" width="200" align="center" :filters="taskFilters"
                    :filter-method="filterHandler" column-key="test_id" sortable>
                    <template #default="{ row }">
                        {{ row.task_name }}
                    </template>
                </el-table-column>
                <el-table-column prop="target_url" label="目标URL" width="300" />
                <el-table-column prop="vul_type" label="漏洞类型" width="350" />
                <el-table-column prop="severity" label="严重等级" width="150" align="center" :filters="[
                    { text: '严重', value: 'critical' },
                    { text: '高危', value: 'high' },
                    { text: '中危', value: 'medium' },
                    { text: '低危', value: 'low' },
                    { text: '信息', value: 'info' }
                ]" :filter-method="filterHandler" column-key="severity" sortable :sort-by="severitySortBy" :sort-method="severitySortMethod">
                    <template #default="scope">
                        <el-tag
                            :style="{ backgroundColor: severityMap[scope.row.severity][0], border: 'none', color: 'white' }"
                            disable-transitions>
                            {{ severityMap[scope.row.severity][1] }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="scan_source" label="扫描工具" width="170" align="center" :filters="sourceFilters"
                    :filter-method="filterHandler" column-key="source" sortable />
                <el-table-column prop="time" label="发现时间" align="center" />

                <el-table-column fixed="right" label="操作" width="150" align="center">
                    <template #default="scope">
                        <el-button link type="primary" @click="showDetail(scope.row)">
                            详情
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div style="margin: 15px 20px 0;">
                <el-pagination v-model:current-page="data.currentPage" v-model:page-size="data.pageSize"
                    :page-sizes="[10, 20, 50]" :total="data.total" layout="total, sizes, prev, pager, next"
                    @current-change="loadVuls" @size-change="loadVuls" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { color } from 'echarts'

const severityMap = {
    critical: ['#8A3A3F', '严重'],
    high: ['#D94F4F', '高危'],
    medium: ['#D6603D', '中危'],
    low: ['#C07535', '低危'],
    info: ['#505997', '信息']
}

// 自定义排序字段
const severityOrder = {
    critical: 5,
    high: 4,
    medium: 3,
    low: 2,
    info: 1
}
const severitySortBy = (row) => {
    return severityOrder[row.severity.toLowerCase()] || 0
}
const severitySortMethod = (a, b) => {
    return severityOrder[b.severity] - severityOrder[a.severity]
}

const data = reactive({
    tableData: [],
    currentPage: 1,
    pageSize: 20,
    total: 0,
    keyword: '',
    activeFilters: {
        task_id: [],
        source: [],
        severity: []
    },
    sortProp: '',
    sortOrder: ''
})

// 加载漏洞数据
const loadVuls = async () => {
    try {
        const res = await request.get('/vuls/vul-list', {
            params: {
                page: data.currentPage,
                size: data.pageSize,
                keyword: data.keyword,
                taskFilter: (data.activeFilters.task_id || []).join(','),
                sourceFilter: (data.activeFilters.source || []).join(','),
                severityFilter: (data.activeFilters.severity || []).join(','),
                sortField: data.sortProp,
                sortOrder: data.sortOrder
            }
        })

        generateFilters(res.data.data)
        data.tableData = res.data.data.map(vul => ({
            ...vul,
            time: formatTime(vul.time)
        }))
        data.total = res.data.total
    } catch (error) {
        ElMessage.error('获取漏洞列表失败')
        console.error(error)
    }
}

// 生成过滤器选项
const taskFilters = ref([])
const sourceFilters = ref([])

// 加载数据时生成过滤器
const generateFilters = (vulList) => {
    // task_id和task_name映射
    const taskMap = new Map()
    vulList.forEach(v => {
        if (!taskMap.has(v.test_id)) {
            taskMap.set(v.test_id, v.task_name)
        }
    })
    const tasks = Array.from(taskMap, ([id, name]) => ({
        text: name,
        value: id
    }))

    // 扫描工具过滤器
    const sources = [...new Set(vulList.map(v => v.scan_source))]
        .map(value => ({ text: value, value }))

    taskFilters.value = tasks
    sourceFilters.value = sources
}

const filterHandler = (value, row, column) => {
    const property = column.property
    return data.activeFilters[property]?.includes(row[property]) ||
        data.activeFilters[property]?.length === 0
}

// 处理筛选条件变化
const handleFilterChange = (filters) => {
    data.activeFilters = {
        ...data.activeFilters,
        ...filters
    }
    data.currentPage = 1
    loadVuls()
}

const handleSortChange = ({ prop, order }) => {
    data.sortProp = prop
    data.sortOrder = order === 'ascending' ? 'asc' : 'desc'
    loadVuls()
}

const handleSearch = () => {
    data.currentPage = 1 // 搜索时重置到第一页
    loadVuls()
}

const handleReset = () => {
    data.keyword = ''
    data.activeFilters = {
        task_id: [],
        source: [],
        severity: []
    }
    data.sortProp = ''
    data.sortOrder = ''
    handleSearch()
}

// 时间格式化
const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString()
}

const severityColor = (severity) => {
    const map = {
        'critical': '#8A3A3F',
        'high': '#D94F4F',
        'medium': '#D6603D',
        'low': '#C07535',
        'info': '#505997'
    }
    return map[severity.toLowerCase()] || '#505997'
}


const showDetail = (vuln) => {
    ElMessageBox.alert(
        `<div class="vuln-detail">
            <h3>${vuln.vul_type || '未知漏洞'}</h3>
            <p><strong>时间：</strong>${formatTime(vuln.time)}</p>
            <p><strong>严重等级：</strong><el-tag :style="{backgroundColor: ${severityColor(vuln.severity)}, border: 'none'}">${vuln.severity}</el-tag></p>
            <p><strong>漏洞来源：</strong>${vuln.scan_source || '未知'}</p>
            <p><strong>攻击详情：</strong>${vuln.details || '无'}</p>
            <p><strong>详细描述：</strong>${vuln.description || '无'}</p>
            <p><strong>解决方案：</strong>${vuln.solution || '暂无解决方案'}</p>
        </div>`,
        {
            title: '漏洞详情',
            dangerouslyUseHTMLString: true,
            customStyle: {
                width: '1200px',
                maxWidth: '90vw' // 响应式最大宽度
            }
        }
    )
}

// 初始化加载
onMounted(() => {
    loadVuls()
})
</script>