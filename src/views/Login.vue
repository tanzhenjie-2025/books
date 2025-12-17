<template>
  <div class="login-container">
    <div class="login-form">
      <h2>图书借阅管理系统</h2>
      <div class="form-group">
        <label>用户名</label>
        <input v-model="username" type="text" placeholder="请输入用户名" />
      </div>
      <div class="form-group">
        <label>密码</label>
        <input v-model="password" type="password" placeholder="请输入密码" />
      </div>
      <div class="form-actions">
        <button @click="handleLogin" class="login-btn">登录</button>
        <button @click="toggleRegister" class="register-btn">
          {{ isRegister ? '返回登录' : '注册账号' }}
        </button>
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <!-- 注册表单 -->
      <div v-if="isRegister" class="register-form">
        <hr>
        <div class="form-group">
          <label>确认密码</label>
          <input v-model="confirmPwd" type="password" placeholder="请确认密码" />
        </div>
        <button @click="handleRegister" class="register-submit">提交注册</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';

const username = ref('');
const password = ref('');
const confirmPwd = ref('');
const errorMessage = ref('');
const isRegister = ref(false);
const router = useRouter();
const userStore = useUserStore();

// 切换登录/注册
const toggleRegister = () => {
  isRegister.value = !isRegister.value;
  errorMessage.value = '';
  confirmPwd.value = '';
};

// 登录处理
const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = '请输入用户名和密码';
    return;
  }

  const result = await userStore.login(username.value, password.value);
  if (result.success) {
    router.push('/home');
  } else {
    errorMessage.value = result.message;
  }
};

// 注册处理
const handleRegister = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = '请输入用户名和密码';
    return;
  }
  if (password.value !== confirmPwd.value) {
    errorMessage.value = '两次密码输入不一致';
    return;
  }

  const result = await userStore.register({
    username: username.value,
    password: password.value
  });

  if (result.success) {
    alert('注册成功，请登录');
    toggleRegister();
  } else {
    errorMessage.value = result.message;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 300px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
}

.login-btn {
  flex: 1;
  padding: 10px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.register-btn {
  flex: 1;
  padding: 10px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.register-submit {
  width: 100%;
  padding: 10px;
  background-color: #909399;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.error-message {
  color: #f56c6c;
  text-align: center;
  margin-top: 1rem;
}
</style>