import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import pinia from './store/index.js'; // 导入Pinia
import './style.css'; // 确保全局样式导入

// 调试：确认Pinia导入成功
console.log('Pinia实例：', pinia);

const app = createApp(App);
app.use(pinia); // 先挂载Pinia，再挂载路由
app.use(router);
app.mount('#app');

console.log('Vue应用挂载成功');