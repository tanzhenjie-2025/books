<template>
  <div class="user-manage-page">
    <h2 class="page-title">用户管理（管理员专属）</h2>

    <div class="admin-actions">
      <button class="btn-primary" @click="$router.push('/book-stats')">
        查看借阅统计
      </button>
    </div>

    <!-- 新增用户表单 -->
    <div class="add-user-form">
      <h3 class="form-title">新增用户</h3>
      <div class="form-item">
        <label class="form-label">用户名：</label>
        <input
          v-model="newUser.username"
          placeholder="请输入用户名"
          class="form-input"
        />
      </div>
      <div class="form-item">
        <label class="form-label">密码：</label>
        <input
          v-model="newUser.password"
          type="password"
          placeholder="默认密码：123456"
          class="form-input"
        />
      </div>
      <div class="form-item">
        <label class="form-label">角色：</label>
        <select v-model="newUser.role" class="form-select">
          <option value="user">普通用户</option>
          <option value="admin">管理员</option>
        </select>
      </div>
      <button class="btn-success" @click="handleAddUser">新增</button>
    </div>

    <!-- 用户列表 -->
    <div class="user-list">
      <UserItem
        v-for="user in userList"
        :key="user.id"
        :user="user"
        @edit="handleEditUser"
        @delete="handleDeleteUser"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '../store/userStore';
import UserItem from '../components/UserItem.vue';

const userStore = useUserStore();
const userList = userStore.userList;

const newUser = ref({
  username: '',
  password: '',
  role: 'user',
});

// 新增用户
const handleAddUser = () => {
  if (!newUser.value.username) {
    alert('请输入用户名');
    return;
  }
  const isDuplicate = userList.some((u) => u.username === newUser.value.username);
  if (isDuplicate) {
    alert('用户名已存在');
    return;
  }
  userStore.addUser(newUser.value);
  alert('新增用户成功');
  newUser.value = { username: '', password: '', role: 'user' };
};

// 编辑用户
const handleEditUser = (editUser) => {
  userStore.editUser(editUser);
  alert('编辑用户成功');
};

// 删除用户
const handleDeleteUser = (userId) => {
  if (!confirm('确定要删除该用户吗？')) {
    return;
  }
  const { success, message } = userStore.deleteUser(userId);
  alert(message);
};
</script>

<style scoped>
/* 页面基础样式 */
.user-manage-page {
  background: #ffffff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 25px;
  color: #1f2937;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
  font-size: 20px;
}

/* 管理员操作按钮 */
.admin-actions {
  margin-bottom: 25px;
}

.btn-primary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background-color: #409eff;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

/* 新增用户表单样式修复 */
.add-user-form {
  background-color: #f9fafb;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 30px;
  border: 1px solid #e4e7ed;
}

.form-title {
  margin-bottom: 20px;
  color: #409eff;
  font-size: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.form-label {
  width: 80px;
  font-size: 14px;
  color: #4b5563;
  text-align: right;
}

.form-input, .form-select {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  min-width: 200px;
}

.form-input:focus, .form-select:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-select {
  height: 40px;
}

.btn-success {
  margin-left: 90px;
  padding: 10px 25px;
  border: none;
  border-radius: 6px;
  background-color: #67c23a;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-success:hover {
  background-color: #85ce61;
}

/* 用户列表样式 */
.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .user-manage-page {
    padding: 20px;
  }

  .form-item {
    flex-direction: column;
    align-items: stretch;
    gap: 5px;
  }

  .form-label {
    width: 100%;
    text-align: left;
  }

  .btn-success {
    margin-left: 0;
    width: 100%;
  }
}
</style>