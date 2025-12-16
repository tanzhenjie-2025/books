<template>
  <div class="app-wrapper">
    <!-- 头部导航栏 -->
    <header class="header" v-if="currentUser">
      <div class="container">
        <div class="header-left">
          <h1 class="logo">
            <span class="icon">📚</span>
            图书借阅管理系统
          </h1>
        </div>
        <div class="header-right">
          <!-- 导航菜单 -->
          <nav class="nav">
            <router-link
              to="/home"
              class="nav-link"
              active-class="active"
            >首页</router-link>
            <router-link
              to="/my-borrow"
              class="nav-link"
              active-class="active"
            >我的借阅</router-link>
            <router-link
              to="/violation"
              class="nav-link"
              active-class="active"
            >违规记录</router-link>
            <router-link
              to="/user-manage"
              class="nav-link"
              active-class="active"
              v-if="currentUser.role === 'admin'"
            >用户管理</router-link>
            <router-link
              to="/add-book"
              class="nav-link"
              active-class="active"
              v-if="currentUser.role === 'admin'"
            >添加书籍</router-link>
          </nav>
          <!-- 用户信息+退出登录 -->
          <div class="user-info">
            <span class="username">{{ currentUser.username }}</span>
            <span class="role">({{ currentUser.role === 'admin' ? '管理员' : '普通用户' }})</span>
            <button class="btn btn-danger logout-btn" @click="logout">
              <span class="icon">🚪</span>退出
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 路由出口（带动画） -->
    <main class="main container">
      <transition name="fade">
        <router-view />
      </transition>
    </main>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const userStore = useUserStore();
const router = useRouter();
const currentUser = computed(() => userStore.currentUser || null);

const logout = () => {
  userStore.logout();
  router.push('/login');
  alert('退出登录成功');
};
</script>

<style scoped>
.header {
  background: var(--primary);
  color: #fff;
  padding: 12px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
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
  display: flex;
  align-items: center;
  gap: 10px;
  .icon {
    font-size: 24px;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav {
  display: flex;
  gap: 2px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 8px 15px;
  border-radius: 4px;
  font-size: 15px;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  &.active {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-weight: 500;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-left: 15px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.username {
  font-weight: 500;
}

.role {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.logout-btn {
  padding: 5px 12px;
  font-size: 14px;
}

.main {
  padding: 30px 0;
  min-height: calc(100vh - 70px);
}

@media (max-width: 768px) {
  .header-right {
    gap: 10px;
  }
  .nav-link {
    padding: 6px 10px;
    font-size: 14px;
  }
  .user-info {
    gap: 8px;
  }
  .username, .role {
    display: none;
  }
}
</style>