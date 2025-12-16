<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="login-title">图书管理系统登录</h2>
      <div class="form-item">
        <label>用户名：</label>
        <input v-model="username" placeholder="请输入用户名" />
      </div>
      <div class="form-item">
        <label>密码：</label>
        <input v-model="password" type="password" placeholder="请输入密码" />
      </div>
      <button class="login-btn" @click="handleLogin">登录</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '../store/userStore';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const userStore = useUserStore();
const router = useRouter();

// 登录处理
const handleLogin = () => {
  if (!username.value || !password.value) {
    alert('请输入用户名和密码！');
    return;
  }

  const { success, message } = userStore.login(username.value, password.value);
  alert(message);
  if (success) {
    router.push('/home');
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  width: 400px;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #409eff;
}

.form-item {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  color: #666;
}

.form-item input {
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #66b1ff;
}
</style>