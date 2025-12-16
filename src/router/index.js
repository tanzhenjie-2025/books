import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/userStore';
import Home from '../views/Home.vue';
import MyBorrow from '../views/MyBorrow.vue';
import Violation from '../views/Violation.vue';
import BookManage from '../views/BookManage.vue';
import AddBook from '../views/AddBook.vue';
import UserManage from '../views/UserManage.vue';
import BookStats from '../views/BookStats.vue';
import Login from '../views/Login.vue';
import BookComment from '../views/BookComment.vue'; // 新增评论页导入

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/home', name: 'Home', component: Home },
  { path: '/my-borrow', name: 'MyBorrow', component: MyBorrow },
  { path: '/violation', name: 'Violation', component: Violation },
  { path: '/book-manage', name: 'BookManage', component: BookManage },
  { path: '/add-book', name: 'AddBook', component: AddBook },
  { path: '/user-manage', name: 'UserManage', component: UserManage },
  { path: '/book-stats', name: 'BookStats', component: BookStats },
  { path: '/book-comment/:bookId', name: 'BookComment', component: BookComment }, // 新增评论页路由
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const currentUser = userStore.currentUser;

  const whiteList = ['/login'];

  if (!whiteList.includes(to.path) && !currentUser) {
    next('/login');
  } else {
    const adminPages = ['/book-manage', '/add-book', '/user-manage', '/book-stats'];
    if (adminPages.includes(to.path) && currentUser?.role !== 'admin') {
      alert('无管理员权限，禁止访问！');
      next('/home');
    } else {
      next();
    }
  }
});

export default router;