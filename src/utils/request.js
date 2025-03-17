import axios from 'axios';
import { ElMessage } from 'element-plus';
import { logout } from '@/utils/user'

const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASEURL || 'http://localhost:5000/api/v1',
    timeout: 10000,
    withCredentials: true, // 允许跨域携带cookie
});

let loadingRequestCount = 0;

const showLoading = (config) => {
    config.loadingTimer = setTimeout(() => {
        if (loadingRequestCount === 0)
            ElMessage.warning('请求处理中...');
        loadingRequestCount++;
    }, 3000);
};

const clearLoading = (config) => {
    clearTimeout(config.loadingTimer);
    if (loadingRequestCount > 0)
        loadingRequestCount--;
}

// request拦截器
request.interceptors.request.use(config => {
    showLoading(config);
    config.headers['Content-Type'] = 'application/json;charset=UTF-8'
    return config;
}, error => {
    clearLoading(error.config);
    return Promise.reject(error);
});

request.interceptors.response.use(res => {
    clearLoading(res.config);
    if (typeof res === 'string')
        res = res ? JSON.parse(res) : res;
    return res;
}, error => {
    console.log(error);
    clearLoading(error.config);
    if (!error.response) ElMessage.error('无法连接服务器，请检查网络或联系管理员');
    else if (error.response.status === 404) ElMessage.error('未找到请求接口！');
    else if (error.response.status === 401) {
        ElMessage.error(error.response.data.error.message + '，2秒后返回登录页面');
        logout();
    } else if (error.response.status) ElMessage.error(error.response.data.error.message);
    else ElMessage.error(error.response.data?.error?.message || '服务器错误');
    return Promise.reject(error);
});

export default request;