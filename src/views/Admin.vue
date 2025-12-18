<template>
  <div class="admin-container">
    <div class="header">
      <h1>管理员面板</h1>
      <div class="nav-buttons">
        <button @click="activeTab = 'books'" :class="{ active: activeTab === 'books' }">书籍管理</button>
        <button @click="activeTab = 'users'" :class="{ active: activeTab === 'users' }">用户管理</button>
        <button @click="activeTab = 'borrows'" :class="{ active: activeTab === 'borrows' }">借阅管理</button>
        <!-- 新增：评论审核按钮 -->
        <button @click="router.push('/admin/comment-audit')" class="comment-audit-btn">评论审核</button>
        <button @click="router.push('/home')" class="back-btn">返回首页</button>
      </div>
    </div>

    <!-- 书籍管理标签页 -->
    <div v-if="activeTab === 'books'" class="tab-content">
      <!-- 添加书籍表单 -->
      <div class="add-book-form">
        <h3>添加新书籍</h3>
        <div class="form-row">
          <div class="form-group">
            <label>书籍名称</label>
            <input v-model="newBook.name" type="text" placeholder="请输入书籍名称" />
          </div>
          <div class="form-group">
            <label>作者</label>
            <input v-model="newBook.author" type="text" placeholder="请输入作者" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>分类</label>
            <input v-model="newBook.category" type="text" placeholder="请输入分类" />
          </div>
          <div class="form-group">
            <label>库存</label>
            <input v-model.number="newBook.stock" type="number" min="0" placeholder="请输入库存数量" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group full-width">
            <label>出版社</label>
            <input v-model="newBook.publish" type="text" placeholder="请输入出版社" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group full-width">
            <label>简介</label>
            <textarea v-model="newBook.description" rows="3" placeholder="请输入书籍简介"></textarea>
          </div>
        </div>
        <button @click="handleAddBook" class="submit-btn">添加书籍</button>
      </div>

      <!-- 书籍列表 -->
      <div class="book-list">
        <h3>书籍列表</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>作者</th>
              <th>分类</th>
              <th>库存</th>
              <th>借阅次数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in bookStore.books" :key="book.id">
              <td>{{ book.id }}</td>
              <td>{{ book.name }}</td>
              <td>{{ book.author }}</td>
              <td>{{ book.category }}</td>
              <td>{{ book.stock }}</td>
              <td>{{ book.borrowCount }}</td>
              <td class="action-buttons">
                <button @click="editBook(book)" class="edit-btn">编辑</button>
                <button @click="deleteBook(book.id)" class="delete-btn">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 编辑书籍弹窗 -->
      <div v-if="isEditModalOpen" class="modal-overlay">
        <div class="modal">
          <h3>编辑书籍</h3>
          <div class="form-row">
            <div class="form-group">
              <label>书籍名称</label>
              <input v-model="editBookForm.name" type="text" />
            </div>
            <div class="form-group">
              <label>作者</label>
              <input v-model="editBookForm.author" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>分类</label>
              <input v-model="editBookForm.category" type="text" />
            </div>
            <div class="form-group">
              <label>库存</label>
              <input v-model.number="editBookForm.stock" type="number" min="0" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group full-width">
              <label>出版社</label>
              <input v-model="editBookForm.publish" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group full-width">
              <label>简介</label>
              <textarea v-model="editBookForm.description" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="isEditModalOpen = false" class="cancel-btn">取消</button>
            <button @click="handleUpdateBook" class="save-btn">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户管理标签页 -->
    <div v-if="activeTab === 'users'" class="tab-content">
      <div class="user-list">
        <h3>用户列表</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>角色</th>
              <th>状态</th>
              <th>违规次数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in userStore.userList" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.role === 'ROLE_ADMIN' ? '管理员' : '普通用户' }}</td>
              <td :class="user.enabled ? 'active' : 'disabled'">
                {{ user.enabled ? '正常' : '禁用' }}
              </td>
              <td>{{ user.violationCount }}/3</td>
              <td class="action-buttons">
                <button @click="toggleUserStatus(user.id, !user.enabled)" class="status-btn">
                  {{ user.enabled ? '禁用' : '启用' }}
                </button>
                <button @click="increaseViolation(user.id)" class="violation-btn" :disabled="user.violationCount >= 3">
                  增加违规
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 借阅管理标签页 -->
    <div v-if="activeTab === 'borrows'" class="tab-content">
      <div class="borrow-list">
        <h3>所有借阅记录</h3>
        <table>
          <thead>
            <tr>
              <th>记录ID</th>
              <th>用户ID</th>
              <th>书籍名称</th>
              <th>借阅时间</th>
              <th>归还状态</th>
              <th>逾期天数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in bookStore.getBorrowRecordsWithOverdue" :key="record.id">
              <td>{{ record.id }}</td>
              <td>{{ record.userId }}</td>
              <td>{{ record.bookName }}</td>
              <td>{{ formatDate(record.borrowTime) }}</td>
              <td :class="record.returned ? 'returned' : 'borrowing'">
                {{ record.returned ? '已归还' : '未归还' }}
              </td>
              <td :class="record.overdue ? 'overdue' : ''">
                {{ record.overdueDays }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { useBookStore } from '@/store/bookStore';

const router = useRouter();
const userStore = useUserStore();
const bookStore = useBookStore();

// 标签页状态
const activeTab = ref('books');

// 添加书籍表单
const newBook = ref({
  name: '',
  author: '',
  category: '',
  stock: 0,
  publish: '',
  description: ''
});

// 编辑书籍相关
const isEditModalOpen = ref(false);
const editBookForm = ref({
  id: '',
  name: '',
  author: '',
  category: '',
  stock: 0,
  publish: '',
  description: ''
});

// 初始化加载数据
onMounted(async () => {
  await bookStore.loadBooks();
  await userStore.loadAllUsers();
  await bookStore.loadAllBorrowRecords();
});

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// 添加书籍
const handleAddBook = async () => {
  if (!newBook.value.name || !newBook.value.author) {
    alert('书籍名称和作者不能为空！');
    return;
  }

  const result = await bookStore.addBook(newBook.value);
  if (result.success) {
    alert(result.message);
    // 重置表单
    newBook.value = {
      name: '',
      author: '',
      category: '',
      stock: 0,
      publish: '',
      description: ''
    };
  } else {
    alert(result.message);
  }
};

// 编辑书籍
const editBook = (book) => {
  editBookForm.value = { ...book };
  isEditModalOpen.value = true;
};

// 更新书籍
const handleUpdateBook = async () => {
  const result = await bookStore.updateBook(editBookForm.value);
  if (result.success) {
    alert(result.message);
    isEditModalOpen.value = false;
  } else {
    alert(result.message);
  }
};

// 删除书籍
const deleteBook = async (bookId) => {
  if (!confirm('确认删除该书籍吗？此操作不可恢复！')) return;

  const result = await bookStore.deleteBook(bookId);
  if (result.success) {
    alert(result.message);
  } else {
    alert(result.message);
  }
};

// 切换用户状态
const toggleUserStatus = async (userId, enabled) => {
  const action = enabled ? '启用' : '禁用';
  if (!confirm(`确认${action}该用户吗？`)) return;

  const result = await userStore.toggleUserStatus(userId, enabled);
  alert(result.message);
};

// 增加用户违规次数
const increaseViolation = async (userId) => {
  if (!confirm('确认增加该用户的违规次数吗？')) return;

  const result = await userStore.increaseViolation(userId);
  alert(result.message);
};
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  margin-bottom: 30px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.nav-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.nav-buttons button {
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f8f9fa;
  cursor: pointer;
}

.nav-buttons button.active {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

/* 新增：评论审核按钮样式 */
.comment-audit-btn {
  background-color: #f5a623 !important;
  color: white !important;
  border-color: #f5a623 !important;
}

.comment-audit-btn:hover {
  background-color: #ff9800 !important;
}

.back-btn {
  margin-left: 10px;
  background-color: #909399 !important;
  color: white !important;
  border-color: #909399 !important;
}

.tab-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.add-book-form {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
}

.form-group.full-width {
  flex: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.submit-btn {
  padding: 10px 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.book-list, .user-list, .borrow-list {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.edit-btn {
  padding: 5px 10px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn {
  padding: 5px 10px;
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.status-btn {
  padding: 5px 10px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.violation-btn {
  padding: 5px 10px;
  background-color: #e6a23c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.violation-btn:disabled {
  background-color: #909399;
  cursor: not-allowed;
}

.active {
  color: #67c23a;
  font-weight: bold;
}

.disabled {
  color: #f56c6c;
}

.returned {
  color: #67c23a;
}

.borrowing {
  color: #409eff;
}

.overdue {
  color: #f56c6c;
  font-weight: bold;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  width: 600px;
  max-width: 90%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  padding: 8px 15px;
  background-color: #909399;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  padding: 8px 15px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>