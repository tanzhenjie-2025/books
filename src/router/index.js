import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Home from '@/views/Home.vue';
import Admin from '@/views/Admin.vue';
import UserCenter from '@/views/UserCenter.vue';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { noAuth: true, title: '登录' }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { title: '管理员面板', requireAdmin: true }
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: UserCenter,
    meta: { title: '个人中心' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置标题
  document.title = to.meta.title || '图书借阅管理系统';

  // 无需登录的页面
  if (to.meta.noAuth) {
    next();
    return;
  }

  // 检查登录状态
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!user || !token) {
    next('/login');
    return;
  }

  // 检查管理员权限
  if (to.meta.requireAdmin && user.role !== 'ROLE_ADMIN') {
    next('/home');
    alert('无管理员权限，无法访问该页面');
    return;
  }

  next();
});

export default router;