<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav class="nav-bar">
      <div class="nav-container">
        <router-link to="/home" class="logo">图书管理系统</router-link>
        <div class="nav-menu">
          <router-link to="/home" class="nav-link">首页</router-link>
          <!-- 普通用户导航 -->
          <router-link to="/borrow-history" class="nav-link" v-if="userStore.currentUser">借阅历史</router-link>
          <router-link to="/violation" class="nav-link" v-if="userStore.currentUser">违规记录</router-link>
          <!-- 管理员专属导航 -->
          <router-link to="/book-manage" class="nav-link" v-if="userStore.currentUser?.role === 'ROLE_ADMIN'">书籍添加</router-link>
          <router-link to="/user-manage" class="nav-link" v-if="userStore.currentUser?.role === 'ROLE_ADMIN'">用户管理</router-link>
          <!-- 新增：评论审核入口 -->
          <router-link to="/admin/comment-audit" class="nav-link" v-if="userStore.currentUser?.role === 'ROLE_ADMIN'">评论审核</router-link>
          <!-- 登录/退出 -->
          <router-link to="/login" class="nav-link" v-if="!userStore.currentUser">登录</router-link>
          <button class="nav-link logout-btn" @click="handleLogout" v-if="userStore.currentUser">退出登录</button>
        </div>
      </div>
    </nav>

    <!-- 核心修复：router-view使用slot props -->
    <div class="content">
      <router-view v-slot="{ Component }">
        <transition name="fade">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUserStore } from './store/userStore';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

// 页面挂载时恢复用户状态（解决刷新丢失）
onMounted(() => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  if (user && token) {
    userStore.currentUser = JSON.parse(user);
    userStore.token = token;
  }
});

// 退出登录
const handleLogout = () => {
  userStore.logout();
  router.push('/login');
  alert('退出登录成功！');
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.nav-bar {
  background-color: #409eff;
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.logout-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.content {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

/* 过渡动画 */
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
</style>