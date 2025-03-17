import request from '@/utils/request.js'
import { ElMessage } from "element-plus";

export const checkLogin = () => {
    return request.get('/auth/check-session')
        .then(() => true)
        .catch(() => {
            ElMessage.warning('请先登录');
            logout();
            return false;
        });
}

export const fetchCurrentUser = async () => {
    const res = await request.get('/auth/me');
    return res.data;
}

export const logout = () => {
    // 调用后端登出接口
    request.post('/auth/logout').finally(() => {
        // 清除残留数据
        localStorage.removeItem('routeTabs');
        setTimeout(() => { location.replace('/login'); }, 1000)
    });
}