import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/userStore';

// 导入页面组件（补充审核评价组件）
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
// 新增：导入审核评价组件
import AdminCommentAudit from '@/views/AdminCommentAudit.vue';

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
  // 新增：审核评价路由
  {
    path: '/comment-audit',
    name: 'AdminCommentAudit',
    component: AdminCommentAudit,
    meta: { requiresAuth: true, requiresAdmin: true } // 仅管理员可访问
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

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isLoggedIn = !!userStore.currentUser;

  if (!to.meta.requiresAuth) {
    if (to.name === 'Login' && isLoggedIn) {
      next('/home');
    } else {
      next();
    }
    return;
  }

  if (!isLoggedIn) {
    next('/login');
    return;
  }

  if (to.meta.requiresAdmin) {
    const isAdmin = userStore.currentUser?.role === 'ROLE_ADMIN';
    if (!isAdmin) {
      next('/home');
      alert('无管理员权限！');
      return;
    }
  }

  next();
});

export default router;