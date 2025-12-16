/**
 * 路由配置（含权限守卫）
 * 课程设计注释：控制页面访问权限，管理员仅能访问用户管理页，未登录不能访问功能页
 */
import { createRouter, createWebHashHistory } from 'vue-router';
import { isLogin, isAdmin, isAccountDisabled } from '@/utils/authUtils';

// 导入页面组件
import Login from '@/views/Login.vue';
import Home from '@/views/Home.vue';
import MyBorrow from '@/views/MyBorrow.vue';
import Violation from '@/views/Violation.vue';
import UserManage from '@/views/UserManage.vue';
import NotFound from '@/views/NotFound.vue';

const routes = [
  {
    path: '/',
    redirect: '/home', // 默认跳转到首页
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录 - 图书借阅管理系统',
      noAuth: true, // 无需登录即可访问
    },
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页 - 图书借阅管理系统',
      requireAuth: true, // 需要登录
    },
  },
  {
    path: '/my-borrow',
    name: 'MyBorrow',
    component: MyBorrow,
    meta: {
      title: '我的借阅 - 图书借阅管理系统',
      requireAuth: true,
    },
  },
  {
    path: '/violation',
    name: 'Violation',
    component: Violation,
    meta: {
      title: '违规记录 - 图书借阅管理系统',
      requireAuth: true,
    },
  },
  {
    path: '/user-manage',
    name: 'UserManage',
    component: UserManage,
    meta: {
      title: '用户管理 - 图书借阅管理系统',
      requireAuth: true,
      requireAdmin: true, // 需要管理员权限
    },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
    meta: {
      noAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404', // 匹配所有未定义路由，跳转到404
  },
    {
    path: '/add-book', // 新增书籍路由
    name: 'AddBook',
    component: () => import('@/views/AddBook.vue'), // 懒加载组件
    meta: {
      title: '添加书籍 - 图书借阅管理系统',
      requireAuth: true, // 需要登录
      requireAdmin: true, // 仅管理员可访问
    },
  },

];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 路由守卫：全局前置守卫（控制权限）
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '图书借阅管理系统';

  // 无需登录的页面（登录、404）
  if (to.meta.noAuth) {
    next();
    return;
  }

  // 需要登录的页面：判断是否登录
  if (!isLogin()) {
    next('/login'); // 未登录跳转到登录页
    return;
  }

  // 已登录：判断账号是否停用
  if (isAccountDisabled()) {
    next('/login'); // 停用则跳转到登录页
    alert('账号因违规≥3次已停用，请联系管理员');
    return;
  }

  // 需要管理员权限的页面：判断是否为管理员
  if (to.meta.requireAdmin && !isAdmin()) {
    next('/home'); // 非管理员跳转到首页
    alert('无管理员权限，无法访问该页面');
    return;
  }

  // 所有权限验证通过
  next();
});

export default router;