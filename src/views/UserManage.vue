<template>
  <div class="user-manage-page">
    <h2 class="page-title">用户管理（管理员专属）</h2>

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
      <div v-for="user in userList" :key="user.id" class="user-card">
        <div class="user-info">
          <span class="user-username">{{ user.username }}</span>
          <span class="user-role">[{{ user.role === 'ROLE_ADMIN' ? '管理员' : '普通用户' }}]</span>
          <span>违规: {{ user.violationCount || 0 }}</span>
          <span :class="user.enabled ? 'status-on' : 'status-off'">
            {{ user.enabled ? '启用' : '禁用' }}
          </span>
        </div>
        <div class="user-actions">
          <button @click="handleToggleStatus(user)">{{ user.enabled ? '封禁' : '解封' }}</button>
          <button @click="openBorrowHistory(user)">借阅历史</button>
        </div>
      </div>
    </div>

    <!-- 借阅历史模态框 -->
    <div class="modal-overlay" v-if="showBorrowModal" @click.self="closeBorrowModal">
      <div class="modal large-modal">
        <h3>{{ selectedUser?.username }} 的借阅记录</h3>
        <div v-if="borrowRecords.length === 0" class="empty-tip">暂无借阅记录</div>
        <table v-else class="borrow-table">
          <thead>
            <tr>
              <th>书籍名称</th>
              <th>借阅时间</th>
              <th>归还时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in borrowRecords" :key="record.id" :class="{ 'returned-row': record.isReturned }">
              <td>{{ getBookName(record.bookId) }}</td>
              <td>{{ record.borrowTime }}</td>
              <td>{{ record.returnTime || '-' }}</td>
              <td>{{ record.isReturned ? '已归还' : '借出' }}</td>
              <td>
                <button v-if="!record.isReturned" @click="adminReturn(record.id)">归还</button>
                <button v-if="!record.isReturned && record.renewCount < 1" @click="adminRenew(record.id)">续借</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeBorrowModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../store/userStore';
import { useBookStore } from '../store/bookStore';
import request from '@/utils/request';

const userStore = useUserStore();
const bookStore = useBookStore();
const userList = userStore.userList;

// 新增用户表单
const newUser = ref({ username: '', password: '', role: 'user' });

// 借阅模态框相关
const showBorrowModal = ref(false);
const selectedUser = ref(null);
const borrowRecords = ref([]);
const allBooks = ref([]); // 用于书名映射

onMounted(async () => {
  await userStore.loadAllUsers();
  await bookStore.loadBooks();
  allBooks.value = bookStore.books; // 获取所有书籍信息
});

const getBookName = (bookId) => {
  const book = allBooks.value.find(b => Number(b.id) === Number(bookId));
  return book ? book.name : '未知书籍';
};

// 修复：直接调用 API 添加用户，并刷新列表
const handleAddUser = async () => {
  if (!newUser.value.username) {
    alert('请输入用户名');
    return;
  }
  const isDuplicate = userList.some(u => u.username === newUser.value.username);
  if (isDuplicate) {
    alert('用户名已存在');
    return;
  }

  try {
    await request.post('/users', {
      username: newUser.value.username,
      password: newUser.value.password || '123456',
      role: newUser.value.role === 'admin' ? 'ROLE_ADMIN' : 'ROLE_USER'
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    alert('新增用户成功');
    // 刷新用户列表
    await userStore.loadAllUsers();
    // 重置表单
    newUser.value = { username: '', password: '', role: 'user' };
  } catch (error) {
    alert('新增失败：' + (error.response?.data?.message || error.message));
  }
};

const handleToggleStatus = async (user) => {
  const newEnabled = !user.enabled;
  const action = newEnabled ? '解封' : '封禁';
  if (!confirm(`确定要${action}用户 ${user.username} 吗？`)) return;
  try {
    await userStore.toggleUserStatus(user.id, newEnabled);
    alert(`${action}成功`);
  } catch (e) {
    alert('操作失败');
  }
};

const openBorrowHistory = async (user) => {
  selectedUser.value = user;
  try {
    const res = await request.get(`/borrows/user/${user.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    borrowRecords.value = res || [];
    showBorrowModal.value = true;
  } catch (e) {
    alert('获取借阅记录失败');
  }
};

const closeBorrowModal = () => {
  showBorrowModal.value = false;
  selectedUser.value = null;
  borrowRecords.value = [];
};

const adminReturn = async (recordId) => {
  try {
    await request.put(`/borrows/admin/return/${recordId}`, null, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    alert('归还成功');
    // 刷新当前用户记录
    openBorrowHistory(selectedUser.value);
  } catch (e) {
    alert('归还失败：' + (e.response?.data?.message || e.message));
  }
};

const adminRenew = async (recordId) => {
  try {
    await request.put(`/borrows/admin/renew/${recordId}`, null, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    alert('续借成功');
    openBorrowHistory(selectedUser.value);
  } catch (e) {
    alert('续借失败：' + (e.response?.data?.message || e.message));
  }
};
</script>

<style scoped>
/* ========== 原有完整样式 ========== */
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

/* 新增用户表单样式 */
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

/* ========== 新增用户卡片样式 ========== */
.user-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f9fafb;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 10px;
}

.user-info span {
  margin-right: 15px;
}

.status-on { color: #67c23a; font-weight: bold; }
.status-off { color: #f56c6c; font-weight: bold; }

.user-actions button {
  margin-left: 10px;
  padding: 5px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.user-actions button:first-child {
  background: #f56c6c; color: white;
}
.user-actions button:last-child {
  background: #409eff; color: white;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 90%;
}

.large-modal {
  width: 700px;
}

.modal h3 {
  margin-bottom: 16px;
}

.borrow-table {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
}

.borrow-table th, .borrow-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.returned-row td {
  opacity: 0.6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.cancel-btn {
  padding: 6px 16px;
  background: #ccc;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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