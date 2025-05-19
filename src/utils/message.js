import { ElMessage } from 'element-plus';

const messageSet = new Set(); // 用于存储当前显示的消息内容

// 显示消息前检查是否已存在
export const showMessage = (type, message) => {
    if (messageSet.has(message)) return; // 如果消息已存在，则不显示
    messageSet.add(message);
    ElMessage[type](message);
    setTimeout(() => messageSet.delete(message), 3000); // 3秒后移除消息
};