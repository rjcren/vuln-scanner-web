<template>
  <div>
    <el-card>
      <template #header>
        <div class="header">
          <span>用户反馈列表</span>
        </div>
      </template>
      <el-table :data="feedbackList" stripe style="width: 100%">
        <el-table-column prop="feedback_id" label="反馈ID" width="120" />
        <el-table-column prop="username" label="反馈用户" width="120" />
        <el-table-column prop="task_name" label="关联任务" width="120" />
        <el-table-column prop="description" label="反馈内容" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type || 'info'">
              {{ statusMap[row.status]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="600">
          <template #default="{ row }">
            <el-button size="small" type="info" @click="viewFeedbackDetails(row)">查看详情</el-button>
            <el-button size="small" type="primary" @click="updateFeedbackStatus(row.feedback_id, 'resolved')">标记为解决</el-button>
            <el-button size="small" type="warning" @click="updateFeedbackStatus(row.feedback_id, 'rejected')">标记为拒绝</el-button>
            <el-button size="small" type="danger" @click="deleteFeedback(row.feedback_id)">删除</el-button>
            <el-button size="small" type="success" @click="openReceiptDialog(row)">发送回执</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 查看详情对话框 -->
    <el-dialog :visible.sync="dialogVisible" title="反馈详情" width="50%">
      <div v-if="selectedFeedback">
        <p><strong>反馈ID：</strong>{{ selectedFeedback.feedback_id }}</p>
        <p><strong>反馈用户：</strong>{{ selectedFeedback.username }}</p>
        <p><strong>关联任务：</strong>{{ selectedFeedback.task_name }}</p>
        <p><strong>反馈内容：</strong>{{ selectedFeedback.description }}</p>
        <p><strong>状态：</strong>{{ statusMap[selectedFeedback.status]?.label || '未知' }}</p>
        <p><strong>创建时间：</strong>{{ selectedFeedback.created_at }}</p>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 发送回执对话框 -->
    <el-dialog :visible.sync="receiptDialogVisible" title="发送反馈回执" width="50%">
      <el-form :model="receiptForm" label-width="80px">
        <el-form-item label="收件人">
          <el-input v-model="receiptForm.email" disabled />
        </el-form-item>
        <el-form-item label="回执内容">
          <el-input type="textarea" v-model="receiptForm.message" placeholder="请输入回执内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="receiptDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="sendReceipt">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";

const feedbackList = ref([]);
const statusMap = {
  pending: { label: "待处理", type: "warning" },
  resolved: { label: "已解决", type: "success" },
  rejected: { label: "已拒绝", type: "danger" },
};

const dialogVisible = ref(false);
const receiptDialogVisible = ref(false);
const selectedFeedback = ref(null);
const receiptForm = ref({
  message: "",
});

const loadFeedbackList = async () => {
  try {
    const res = await request.get("/feedback");
    feedbackList.value = res.data;
  } catch (error) {
    ElMessage.error("获取反馈列表失败");
  }
};

const viewFeedbackDetails = (feedback) => {
  selectedFeedback.value = feedback;
  dialogVisible.value = true;
};

const updateFeedbackStatus = async (feedbackId, newStatus) => {
  try {
    await request.patch(`/feedback/${feedbackId}`, { status: newStatus });
    ElMessage.success("反馈状态已更新");
    loadFeedbackList();
  } catch (error) {
    ElMessage.error("更新反馈状态失败");
  }
};

const deleteFeedback = async (feedbackId) => {
  try {
    await ElMessageBox.confirm("确定要删除这条反馈吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await request.delete(`/feedback/${feedbackId}`);
    ElMessage.success("反馈已删除");
    loadFeedbackList();
  } catch (error) {
    ElMessage.error("删除反馈失败");
  }
};

const openReceiptDialog = () => {
  receiptForm.value.message = "";
  receiptDialogVisible.value = true;
};

const sendReceipt = async () => {
  try {
    await request.post("/feedback/receipt", {
      message: receiptForm.value.message,
    });
    ElMessage.success("回执已发送");
    receiptDialogVisible.value = false;
  } catch (error) {
    ElMessage.error("发送回执失败");
  }
};

onMounted(() => {
  loadFeedbackList();
});
</script>

<style scoped>
.header {
  font-size: 18px;
  font-weight: bold;
}
</style>