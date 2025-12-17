import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/userStore';

// 导入页面组件（修正个人中心组件路径为UserCenter.vue）
import Login from '@/views/Login.vue';
import Home from '@/views/Home.vue';
import MyBorrow from '@/views/MyBorrow.vue';
import Violation from '@/views/Violation.vue';
import BookManage from '@/views/BookManage.vue';
import UserManage from '@/views/UserManage.vue';
import BorrowHistory from '@/views/BorrowHistory.vue';
// 修正：导入个人中心组件（文件名UserCenter.vue）
import UserCenter from '@/views/UserCenter.vue';
// 管理员面板组件（文件名Admin.vue）
import Admin from '@/views/Admin.vue';

// 路由规则（补充/user路由，对应UserCenter组件）
const routes = [
  {
    path: '/',
    redirect: '/home' // 默认跳首页
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false } // 无需登录
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true } // 需要登录
  },
  {
    path: '/my-borrow',
    name: 'MyBorrow',
    component: MyBorrow,
    meta: { requiresAuth: true } // 需要登录
  },
  {
    path: '/borrow-history',
    name: 'BorrowHistory',
    component: BorrowHistory,
    meta: { requiresAuth: true } // 需要登录
  },
  {
    path: '/violation',
    name: 'Violation',
    component: Violation,
    meta: { requiresAuth: true } // 需要登录
  },
  // 修正：个人中心路由（对应UserCenter.vue组件）
  {
    path: '/user',
    name: 'UserCenter', // 可选：name改为UserCenter更语义化
    component: UserCenter,
    meta: { requiresAuth: true } // 需要登录
  },
  // 管理员面板路由（对应Admin.vue组件）
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true } // 需要登录+管理员权限
  },
  {
    path: '/book-manage',
    name: 'BookManage',
    component: BookManage,
    meta: { requiresAuth: true, requiresAdmin: true } // 需要管理员权限
  },
  {
    path: '/user-manage',
    name: 'UserManage',
    component: UserManage,
    meta: { requiresAuth: true, requiresAdmin: true } // 需要管理员权限
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫：验证登录状态和权限（原有逻辑完全保留）
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isLoggedIn = !!userStore.currentUser; // 是否登录

  // 无需登录的路由直接放行
  if (!to.meta.requiresAuth) {
    // 已登录用户访问登录页，跳首页
    if (to.name === 'Login' && isLoggedIn) {
      next('/home');
    } else {
      next();
    }
    return;
  }

  // 需要登录的路由
  if (!isLoggedIn) {
    next('/login'); // 未登录跳登录页
    return;
  }

  // 需要管理员权限的路由（/admin、/book-manage、/user-manage）
  if (to.meta.requiresAdmin) {
    const isAdmin = userStore.currentUser?.role === 'ROLE_ADMIN';
    if (!isAdmin) {
      next('/home'); // 非管理员跳首页
      alert('无管理员权限！');
      return;
    }
  }

  // 所有验证通过
  next();
});

export default router;