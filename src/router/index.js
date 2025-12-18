import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/userStore';

// 导入所有页面组件
import Login from '@/views/Login.vue';
import Home from '@/views/Home.vue';
import MyBorrow from '@/views/MyBorrow.vue';
import Violation from '@/views/Violation.vue';
import BookManage from '@/views/BookManage.vue';
import UserManage from '@/views/UserManage.vue';
import BorrowHistory from '@/views/BorrowHistory.vue';
import UserCenter from '@/views/UserCenter.vue';
import Admin from '@/views/Admin.vue';
import AddBook from '@/views/AddBook.vue';
import BookComments from '@/views/BookComments.vue';
import BookStats from '@/views/BookStats.vue'; // 借阅统计组件

// 路由规则
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/add-book',
    name: 'AddBook',
    component: AddBook,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/book-comments/:id',
    name: 'BookComments',
    component: BookComments,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-borrow',
    name: 'MyBorrow',
    component: MyBorrow,
    meta: { requiresAuth: true }
  },
  {
    path: '/borrow-history',
    name: 'BorrowHistory',
    component: BorrowHistory,
    meta: { requiresAuth: true }
  },
  {
    path: '/violation',
    name: 'Violation',
    component: Violation,
    meta: { requiresAuth: true }
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: UserCenter,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/book-manage',
    name: 'BookManage',
    component: BookManage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/user-manage',
    name: 'UserManage',
    component: UserManage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // 借阅统计路由（管理员专属）
  {
    path: '/book-stats',
    name: 'BookStats',
    component: BookStats,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // 404路由
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

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isLoggedIn = !!userStore.currentUser;

  // 无需登录的页面
  if (!to.meta.requiresAuth) {
    if (to.name === 'Login' && isLoggedIn) {
      next('/home');
    } else {
      next();
    }
    return;
  }

  // 需要登录但未登录
  if (!isLoggedIn) {
    next('/login');
    alert('请先登录！');
    return;
  }

  // 需要管理员权限验证
  if (to.meta.requiresAdmin) {
    const isAdmin = userStore.currentUser?.role === 'ROLE_ADMIN'; // 匹配数据库角色字段
    if (!isAdmin) {
      next('/home');
      alert('无管理员权限，无法访问该页面！');
      return;
    }
  }

  next();
});

export default router;