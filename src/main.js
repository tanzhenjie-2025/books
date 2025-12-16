import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index.js';

// 创建Vue应用
const app = createApp(App);

// 安装插件
app.use(createPinia());
app.use(router);

// 挂载应用
app.mount('#app');

console.log('Vue应用挂载成功');