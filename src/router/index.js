import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/userStore'; // 关键：导入useUserStore
import Home from '@/views/Home.vue';
import MyBorrow from '@/views/MyBorrow.vue';
import UserManage from '@/views/UserManage.vue';
import AddBook from '@/views/AddBook.vue';
import BookManage from '@/views/BookManage.vue';
import Login from '@/views/Login.vue';
import Violation from '@/views/Violation.vue';
import BookComments from '@/views/BookComments.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/home', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/my-borrow', name: 'MyBorrow', component: MyBorrow, meta: { requiresAuth: true } },
  { path: '/user-manage', name: 'UserManage', component: UserManage, meta: { requiresAuth: true, isAdmin: true } },
  { path: '/add-book', name: 'AddBook', component: AddBook, meta: { requiresAuth: true, isAdmin: true } },
  { path: '/book-manage', name: 'BookManage', component: BookManage, meta: { requiresAuth: true, isAdmin: true } },
  { path: '/violation', name: 'Violation', component: Violation, meta: { requiresAuth: true } },
  { path: '/book-comments/:id', name: 'BookComments', component: BookComments, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 修复路由守卫：在守卫内部获取store（确保Pinia已初始化）
router.beforeEach((to, from, next) => {
  // 关键：在守卫内部调用useUserStore，确保Pinia已初始化
  const userStore = useUserStore();
  const isAuthenticated = !!userStore.currentUser;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.meta.isAdmin && userStore.currentUser?.role !== 'admin') {
    next('/home');
  } else {
    next();
  }
});

export default router;