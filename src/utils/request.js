import axios from 'axios';

// 创建axios实例（核心：baseURL包含/api上下文路径，匹配后端配置）
const request = axios.create({
  baseURL: 'http://localhost:8080/api', // 匹配server.servlet.context-path=/api
  timeout: 10000, // 延长超时时间，避免评价提交超时
  withCredentials: true, // 保留跨域凭证
  headers: {
    'Content-Type': 'application/json;charset=utf-8' // 统一请求头
  }
});

// 请求拦截器：添加JWT Token到请求头
request.interceptors.request.use(
  (config) => {
    // 从localStorage获取token（和UserStore保持一致）
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 标准JWT格式
    }
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理错误 + 提取响应数据
request.interceptors.response.use(
  (response) => {
    // 直接返回响应体data，简化前端取值
    return response.data;
  },
  (error) => {
    // 处理401（未认证）/403（无权限）：跳转到登录页
    if (error.response?.status === 401 || error.response?.status === 403) {
      // 清空本地存储，强制退出
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // 跳转到登录页（兼容vue-router）
      window.location.href = '/login';
      alert('登录状态已过期，请重新登录');
    }
    // 统一错误提示（友好化）
    const errMsg = error.response?.data?.message || error.message || '服务器内部错误，请稍后重试';
    console.error('响应错误:', errMsg);
    return Promise.reject({ ...error, message: errMsg });
  }
);

export default request;