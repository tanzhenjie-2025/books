import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useUserStore } from '@/store/userStore'; // 导入用户Store

// 创建应用实例
const app = createApp(App);

// 挂载Pinia和路由
app.use(createPinia());
app.use(router);

// 初始化用户信息（页面刷新后恢复本地存储的用户/Token）
const userStore = useUserStore();
if (localStorage.getItem('user') && localStorage.getItem('token')) {
  userStore.currentUser = JSON.parse(localStorage.getItem('user'));
  userStore.token = localStorage.getItem('token');
}

// 全局挂载（可选：方便模板中使用）
app.config.globalProperties.$userStore = userStore;

// 挂载应用
app.mount('#app');