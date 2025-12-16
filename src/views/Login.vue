<template>
  <div class="login-page">
    <div class="card"> <!-- 把card类拆到内部div，避免scoped隔离 -->
      <h2 class="login-title">图书借阅管理系统 - 登录</h2>
      <div class="login-form">
        <div class="form-item">
          <label>用户名：</label>
          <input
            v-model="username"
            type="text"
            placeholder="请输入用户名（测试：user1/admin）"
          />
        </div>
        <div class="form-item">
          <label>密码：</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码（测试：123456/admin123）"
          />
        </div>
        <button class="btn btn-primary login-btn" @click="handleLogin">登录</button>
      </div>
      <div class="login-tips">
        <p>测试账号1（普通用户）：user1 / 123456（违规1次）</p>
        <p>测试账号2（停用用户）：user2 / 123456（违规3次，已停用）</p>
        <p>测试账号3（管理员）：admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 登录页面
 * 课程设计注释：实现用户登录验证，区分普通用户/管理员，判断账号是否停用
 */
import { ref } from 'vue';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'vue-router';

// 调试：确认代码执行到这里
console.log('Login组件初始化');

// 登录表单数据
const username = ref('');
const password = ref('');

// 初始化状态和路由
const userStore = useUserStore();
const router = useRouter();

/**
 * 处理登录逻辑
 */
const handleLogin = () => {
  // 表单验证
  if (!username.value || !password.value) {
    alert('请输入用户名和密码');
    return;
  }

  // 调用登录方法
  const { success, message } = userStore.login(username.value, password.value);
  if (success) {
    alert(message);
    router.push('/home'); // 登录成功跳转到首页
  } else {
    alert(message); // 登录失败提示
  }
};
</script>

<style> /* 移除scoped，让全局样式生效 */
.login-page {
  width: 100%;
  padding: 50px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
}

.login-page .card {
  max-width: 500px;
  width: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 40px 30px;
  text-align: center;
}

.login-title {
  margin-bottom: 30px;
  color: #409eff;
  font-size: 24px;
}

.login-form {
  width: 80%;
  margin: 0 auto;
}

.form-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.form-item label {
  width: 80px;
  text-align: right;
  margin-right: 10px;
  font-size: 14px;
  color: #333;
}

.form-item input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.login-btn {
  width: calc(80% - 80px);
  margin-left: 80px;
  margin-top: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  cursor: pointer;
}

.login-btn:hover {
  background: #66b1ff;
}

.login-tips {
  margin-top: 30px;
  text-align: left;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}
</style>