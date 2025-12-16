<template>
  <div class="user-info-page">
    <h2 class="page-title">个人信息修改</h2>
    <div class="info-form card">
      <div class="form-item">
        <label>当前用户名：</label>
        <span class="current-info">{{ currentUser.username }}</span>
      </div>
      <div class="form-item">
        <label>新用户名：</label>
        <input v-model="newInfo.username" type="text" placeholder="不修改则留空" class="form-input" />
      </div>
      <div class="form-item">
        <label>原密码：</label>
        <input v-model="newInfo.oldPassword" type="password" placeholder="修改密码需填写" class="form-input" />
      </div>
      <div class="form-item">
        <label>新密码：</label>
        <input v-model="newInfo.newPassword" type="password" placeholder="修改密码需填写" class="form-input" />
      </div>
      <button class="btn submit-btn" @click="handleUpdate">保存修改</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/store/userStore';

const userStore = useUserStore();
const currentUser = ref(userStore.currentUser);
const newInfo = ref({
  username: '',
  oldPassword: '',
  newPassword: ''
});

// 验证表单
const validateForm = () => {
  // 修改密码时必须填写原密码和新密码
  if ((newInfo.value.oldPassword && !newInfo.value.newPassword) || (!newInfo.value.oldPassword && newInfo.value.newPassword)) {
    alert('修改密码需同时填写原密码和新密码！');
    return false;
  }
  // 新密码长度≥6
  if (newInfo.value.newPassword && newInfo.value.newPassword.length < 6) {
    alert('新密码长度不能少于6位！');
    return false;
  }
  return true;
};

// 提交修改
const handleUpdate = () => {
  if (!validateForm()) return;

  // 过滤空值（不修改的字段不传）
  const submitInfo = {};
  if (newInfo.value.username) submitInfo.username = newInfo.value.username;
  if (newInfo.value.oldPassword) {
    submitInfo.oldPassword = newInfo.value.oldPassword;
    submitInfo.newPassword = newInfo.value.newPassword;
  }

  const { success, message } = userStore.updateUserInfo(submitInfo);
  alert(message);
  if (success) {
    // 重置表单+刷新当前用户信息
    newInfo.value = { username: '', oldPassword: '', newPassword: '' };
    currentUser.value = userStore.currentUser;
  }
};
</script>

<style scoped>
.user-info-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 80px);
}

.page-title {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}

.info-form {
  max-width: 500px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.form-item {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.current-info {
  color: #666;
  font-size: 14px;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}

.submit-btn:hover {
  background: #66b1ff;
}
</style>