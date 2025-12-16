<template>
  <div class="app-wrapper">
    <!-- 头部导航栏（仅登录后显示，添加空值判断！） -->
    <header class="header" v-if="currentUser">
      <div class="container">
        <div class="header-left">
          <h1 class="logo">图书借阅管理系统</h1>
        </div>
        <div class="header-right">
          <!-- 导航菜单（按角色显示） -->
          <nav class="nav">
            <router-link to="/home">首页</router-link>
            <router-link to="/my-borrow">我的借阅</router-link>
            <router-link to="/violation">违规记录</router-link>
            <!-- 管理员显示用户管理 -->
            <router-link to="/user-manage" v-if="currentUser.role === 'admin'">用户管理</router-link>
            <router-link to="/add-book" v-if="currentUser.role === 'admin'">添加书籍</router-link>
          </nav>
          <!-- 用户信息+退出登录 -->
          <div class="user-info">
            <span class="username">{{ currentUser.username }}</span>
            <span class="role">({{ currentUser.role === 'admin' ? '管理员' : '普通用户' }})</span>
            <button class="btn btn-danger logout-btn" @click="logout">退出登录</button>
          </div>
        </div>
      </div>
    </header>

    <!-- 路由出口（页面内容，始终显示） -->
    <main class="main container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
/**
 * 根组件：包含全局导航栏和路由出口
 * 课程设计注释：按用户角色动态显示导航菜单，实现退出登录功能
 * 修复点：添加currentUser空值判断，避免未登录时访问null的属性
 */
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'vue-router';
import { computed } from 'vue'; // 新增：用computed响应式获取currentUser

// 初始化状态和路由
const userStore = useUserStore();
const router = useRouter();

// 修复：用computed包裹，确保响应式+空值安全
const currentUser = computed(() => userStore.currentUser || null);

// 退出登录方法
const logout = () => {
  userStore.logout();
  router.push('/login');
  alert('退出登录成功');
};
</script>

<style scoped>
.header {
  background: #409eff;
  color: #fff;
  padding: 10px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav a {
  color: #fff;
  text-decoration: none;
  margin: 0 15px;
  font-size: 16px;
}

.nav a:hover,
.nav a.router-link-active {
  text-decoration: underline;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  font-weight: bold;
}

.logout-btn {
  padding: 5px 10px;
  font-size: 14px;
}

.main {
  padding: 30px 0;
  min-height: calc(100vh - 80px);
}

/* 全局容器样式（补充） */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
</style>