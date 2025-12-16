import { createApp } from 'vue';
import { createPinia } from 'pinia'; // 导入Pinia
import App from './App.vue';
import router from './router/index.js';
import './style.css';

// 1. 创建Pinia实例
const pinia = createPinia();

// 2. 创建Vue应用并按顺序使用插件
const app = createApp(App);
app.use(pinia); // 先挂载Pinia
app.use(router); // 后挂载Router（确保路由守卫能获取到Pinia）

// 3. 挂载应用
app.mount('#app');

console.log('Vue应用挂载成功');