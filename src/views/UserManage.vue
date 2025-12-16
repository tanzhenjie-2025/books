<template>
  <div class="user-manage-page">
    <h2 class="page-title">用户管理（管理员专属）</h2>

    <!-- 新增用户表单 -->
    <div class="add-user-form card">
      <h3>新增用户</h3>
      <div class="form-item">
        <label>用户名：</label>
        <input v-model="newUser.username" placeholder="请输入用户名" />
      </div>
      <div class="form-item">
        <label>密码：</label>
        <input
          v-model="newUser.password"
          type="password"
          placeholder="默认密码：123456"
        />
      </div>
      <div class="form-item">
        <label>角色：</label>
        <select v-model="newUser.role">
          <option value="user">普通用户</option>
          <option value="admin">管理员</option>
        </select>
      </div>
      <button class="btn btn-success" @click="handleAddUser">新增</button>
    </div>

    <!-- 用户列表 -->
    <div class="user-list list">
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
/**
 * 用户管理页面（管理员专属）：实现用户的增删改查
 * 课程设计注释：管理员核心功能，支持新增/编辑/删除用户，控制用户角色和状态
 */
import { ref } from 'vue';
import { useUserStore } from '@/store/userStore';
import UserItem from '@/components/UserItem.vue';

// 初始化用户状态
const userStore = useUserStore();
const userList = userStore.userList;

// 新增用户表单数据
const newUser = ref({
  username: '',
  password: '',
  role: 'user',
});

/**
 * 处理新增用户
 */
const handleAddUser = () => {
  if (!newUser.value.username) {
    alert('请输入用户名');
    return;
  }
  // 检查用户名是否重复
  const isDuplicate = userList.some((u) => u.username === newUser.value.username);
  if (isDuplicate) {
    alert('用户名已存在');
    return;
  }
  // 调用新增用户方法
  userStore.addUser(newUser.value);
  alert('新增用户成功');
  // 清空表单
  newUser.value = { username: '', password: '', role: 'user' };
};

/**
 * 处理编辑用户
 * @param {Object} editUser 编辑后的用户信息
 */
const handleEditUser = (editUser) => {
  userStore.editUser(editUser);
  alert('编辑用户成功');
};

/**
 * 处理删除用户
 * @param {Number} userId 用户ID
 */
const handleDeleteUser = (userId) => {
  if (!confirm('确定要删除该用户吗？')) {
    return;
  }
  const { success, message } = userStore.deleteUser(userId);
  alert(message);
};
</script>

<style scoped>
.user-manage-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.page-title {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}

.add-user-form {
  margin-bottom: 30px;
}

.add-user-form h3 {
  margin-bottom: 20px;
  color: #409eff;
}

.add-user-form select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}
</style>