<template>
  <div class="user-manage-page card">
    <h2 class="page-title">用户管理</h2>

    <!-- 新增用户表单 -->
    <div class="add-user-form card" style="margin-bottom: 30px;">
      <h3 style="margin-bottom: 20px; font-size: 16px; color: var(--text-primary);">新增用户</h3>
      <div class="form-item">
        <label>用户名：</label>
        <div class="input-wrap">
          <input
            v-model="newUser.username"
            placeholder="请输入用户名"
            maxlength="20"
          />
        </div>
      </div>
      <div class="form-item">
        <label>密码：</label>
        <div class="input-wrap">
          <input
            v-model="newUser.password"
            type="password"
            placeholder="请输入密码"
            maxlength="20"
          />
          <span class="form-tip">6-20位字符</span>
        </div>
      </div>
      <div class="form-item">
        <label>角色：</label>
        <div class="input-wrap">
          <select v-model="newUser.role">
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
      </div>
      <div class="form-submit">
        <button class="btn btn-primary" @click="addUser">
          <span class="icon">➕</span>新增用户
        </button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="user-list">
      <h3 style="margin-bottom: 15px; font-size: 16px; color: var(--text-primary);">用户列表</h3>
      <div class="empty-tip" v-if="userList.length === 0">
        暂无用户，请添加
      </div>
      <div class="list" v-else>
        <transition-group name="slide" tag="div">
          <div class="list-item" v-for="user in userList" :key="user.id">
            <div class="user-info">
              <span class="username">{{ user.username }}</span>
              <span class="role-tag" :class="user.role === 'admin' ? 'admin-tag' : 'user-tag'">
                {{ user.role === 'admin' ? '管理员' : '普通用户' }}
              </span>
            </div>
            <div class="user-actions">
              <button class="btn btn-danger" @click="deleteUser(user.id)">
                <span class="icon">🗑️</span>删除
              </button>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/userStore';

const userStore = useUserStore();
const userList = ref([]);
const newUser = ref({
  username: '',
  password: '',
  role: 'user'
});

// 初始化用户列表
const initUserList = () => {
  userList.value = userStore.users || [];
};

// 新增用户
const addUser = () => {
  if (!newUser.value.username.trim()) {
    alert('请输入用户名！');
    return;
  }
  if (!newUser.value.password.trim()) {
    alert('请输入密码！');
    return;
  }
  const { success, message } = userStore.addUser({
    id: Date.now().toString(),
    ...newUser.value
  });
  alert(message);
  if (success) {
    // 重置表单
    newUser.value = { username: '', password: '', role: 'user' };
    initUserList();
  }
};

// 删除用户
const deleteUser = (userId) => {
  if (confirm('确定要删除该用户吗？')) {
    const { success, message } = userStore.deleteUser(userId);
    alert(message);
    if (success) {
      initUserList();
    }
  }
};

onMounted(() => {
  initUserList();
});
</script>

<style scoped>
.user-manage-page {
  padding: 25px;
}

.add-user-form {
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: var(--shadow);
}

.user-list {
  margin-top: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.admin-tag {
  background: var(--primary);
}

.user-tag {
  background: var(--success);
}

.user-actions {
  display: flex;
  gap: 8px;
}

/* 适配小屏幕 */
@media (max-width: 768px) {
  .form-submit {
    padding-left: 80px;
  }
}
</style>