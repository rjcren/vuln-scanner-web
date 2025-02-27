import request from '@/utils/request.js'
import { ElMessage } from "element-plus";

export const parsejwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch (e) {
        return null;
    }
}

export const checkLogin = () => {
    // 获取本地存储的token和过期时间
    const token = localStorage.getItem('jwt_token')
    const expiration = localStorage.getItem('token_expiration')

    if (!token || Date.now() > expiration) {
        ElMessage.warning('请先登录')
        // 清除无效的token
        logout()
        // 跳转到登录页并携带当前路径
        return false
    }
    // 设置请求头
    request.defaults.headers.common['Authorization'] = `Bearer ${token}`
    return true
}

export const logout = () => {
    // 清除本地存储
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('token_expiration');

    // 清除axios默认授权头
    delete request.defaults.headers.common['Authorization'];

    // 提示并跳转
    setTimeout( () => { location.replace('/login'); }, 2000)
}