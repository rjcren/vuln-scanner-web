import axios from 'axios';
import { ElMessage } from 'element-plus';
import { logout, parsejwt } from '@/utils/user'

const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASEURL || 'http://localhost:5000/api/v1',
    timeout: 10000,
});

// request拦截器
request.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/json;charset=UTF-8'
    const token = localStorage.getItem('jwt_token')
    const exp = localStorage.getItem('token_expiration');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
        const decoded = parsejwt(token);
        const isExpired = decoded?.exp * 1000 < Date.now();
        if (isExpired) {
            ElMessage.error('登录已过期，请重新登录');
            logout();
            window.location.href = '/login';
            return Promise.reject(new Error('Token expired'));
        }
    }

    return config;
}, error => {
    return Promise.reject(error);
});

request.interceptors.response.use(response => {
    let res = response;
    if (typeof res === 'string') {
        res = res ? JSON.parse(res) : res;
    }
    return res;
}, error => {
    if (!error.response) ElMessage.error('无法连接服务器，请检查网络或联系管理员');
    else if (error.response.status === 404) ElMessage.error('未找到请求接口！');
    else if (error.response.status === 401) {
        ElMessage.error(error.response.data.error.message+'2秒后返回登录页面');
        logout();
    } else if (error.response.status)ElMessage.error(error.response.data.error.message);
    return Promise.reject(error);
});

export default request;