<template>
  <div class="book-manage-page">
    <h2 class="page-title">书籍管理（管理员）</h2><router-link to="/operation-logs" class="nav-link" v-if="userStore.currentUser?.role === 'ROLE_ADMIN'">
  操作日志
</router-link>

    <!-- 仅管理员可见操作按钮 -->
    <div class="manage-actions" v-if="userStore.currentUser?.role === 'ROLE_ADMIN'">
      <button class="btn-primary" @click="goAddBook">添加新书籍</button>
    </div>

    <!-- 书籍表格 -->
    <div class="book-manage-table" v-if="bookStore.adminBooks.length > 0">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>书名</th>
            <th>作者</th>
            <th>分类</th>
            <th>出版社</th>
            <th>库存</th>
            <th>借阅次数</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in bookStore.adminBooks" :key="book.id" :class="{ 'deleted-row': book.deleted }">
            <td>{{ book.id }}</td>
            <td>{{ book.name }}</td>
            <td>{{ book.author }}</td>
            <td>{{ book.category }}</td>
            <td>{{ book.publish }}</td>
            <td>
              <input
                v-model="stockForm[book.id]"
                type="number"
                min="0"
                class="stock-input"
                @blur="handleStockBlur(book.id)"
              />
            </td>
            <td>{{ book.borrowCount }}</td>
            <td>
              <span v-if="book.deleted" class="deleted-tag">已下架</span>
              <span v-else class="active-tag">在架</span>
            </td>
            <td class="action-cell" v-if="userStore.currentUser?.role === 'ROLE_ADMIN'">
              <button class="save-stock-btn" @click="handleUpdateStock(book.id)">保存库存</button>
              <button class="edit-btn" @click="openEditModal(book)">编辑</button>
              <button v-if="!book.deleted" class="off-btn" @click="handleSoftDelete(book.id)">下架</button>
              <button v-else class="on-btn" @click="handleRestore(book.id)">上架</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="empty-tip" v-if="bookStore.adminBooks.length === 0">暂无书籍</div>

    <!-- 编辑模态框 -->
    <div class="modal-overlay" v-if="showEditModal" @click.self="closeEditModal">
      <div class="modal">
        <h3>编辑书籍</h3>
        <div class="form-group">
          <label>书名</label>
          <input v-model="editForm.name" />
        </div>
        <div class="form-group">
          <label>作者</label>
          <input v-model="editForm.author" />
        </div>
        <div class="form-group">
          <label>分类</label>
          <input v-model="editForm.category" />
        </div>
        <div class="form-group">
          <label>出版社</label>
          <input v-model="editForm.publish" />
        </div>
        <div class="form-group">
          <label>库存</label>
          <input v-model.number="editForm.stock" type="number" min="0" />
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea v-model="editForm.description" rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeEditModal">取消</button>
          <button class="confirm-btn" @click="submitEdit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBookStore } from '../store/bookStore';
import { useUserStore } from '../store/userStore';  // 新增导入
import { useRouter } from 'vue-router';

const bookStore = useBookStore();
const userStore = useUserStore();  // 定义 userStore
const router = useRouter();

// 快捷库存表单
const stockForm = ref({});

// 编辑相关
const showEditModal = ref(false);
const editForm = ref({
  id: null,
  name: '',
  author: '',
  category: '',
  publish: '',
  stock: 0,
  description: ''
});

onMounted(async () => {
  await bookStore.loadAdminBooks();
  initStockForm();
});

const initStockForm = () => {
  bookStore.adminBooks.forEach(book => {
    stockForm.value[book.id] = book.stock;
  });
};

const handleStockBlur = (bookId) => {
  const book = bookStore.adminBooks.find(b => b.id === bookId);
  if (!book) return;
  if (stockForm.value[bookId] === '' || isNaN(stockForm.value[bookId])) {
    stockForm.value[bookId] = book.stock;
  }
};

const handleUpdateStock = async (bookId) => {
  const newStock = Number(stockForm.value[bookId]);
  try {
    await bookStore.updateBookStock(bookId, newStock);
    alert('库存更新成功');
  } catch (error) {
    alert('更新失败：' + error.message);
  }
};

const handleSoftDelete = async (id) => {
  if (!confirm('确认下架该书籍？')) return;
  try {
    await bookStore.softDeleteBook(id);
    alert('下架成功');
  } catch (e) {
    alert('操作失败');
  }
};

const handleRestore = async (id) => {
  try {
    await bookStore.restoreBook(id);
    alert('上架成功');
  } catch (e) {
    alert('操作失败');
  }
};

const openEditModal = (book) => {
  editForm.value = {
    id: book.id,
    name: book.name,
    author: book.author,
    category: book.category,
    publish: book.publish,
    stock: book.stock,
    description: book.description
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
};

const submitEdit = async () => {
  try {
    await bookStore.updateBook(editForm.value);
    alert('修改成功');
    closeEditModal();
    initStockForm();
  } catch (e) {
    alert('修改失败：' + e.message);
  }
};

const goAddBook = () => {
  router.push('/add-book');
};
</script>

<style scoped>
/* 原有完整样式保持不变 */
.book-manage-page { background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); max-width: 1200px; margin: 0 auto; }
.page-title { margin-bottom: 25px; color: #1f2937; border-bottom: 2px solid #409eff; padding-bottom: 10px; font-size: 20px; }
.manage-actions { margin-bottom: 25px; }
.btn-primary { padding: 10px 20px; border: none; border-radius: 6px; background-color: #409eff; color: white; font-size: 14px; cursor: pointer; }
.btn-primary:hover { background-color: #66b1ff; }
.book-manage-table { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e4e7ed; border-radius: 8px; overflow: hidden; }
.table thead { background-color: #f9fafb; }
.table th, .table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e4e7ed; font-size: 14px; }
.table th { color: #1f2937; font-weight: 600; }
.table td { color: #4b5563; }
.stock-input { width: 80px; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px; outline: none; text-align: center; }
.stock-input:focus { border-color: #409eff; box-shadow: 0 0 0 2px rgba(64,158,255,0.2); }
.empty-tip { text-align: center; padding: 50px; font-size: 16px; color: #9ca3af; background-color: #f9fafb; border-radius: 8px; border: 1px dashed #e4e7ed; margin-top: 20px; }
.deleted-row { opacity: 0.6; background-color: #f2f2f2; }
.deleted-tag { color: #f56c6c; font-weight: bold; }
.active-tag { color: #67c23a; font-weight: bold; }
.save-stock-btn, .edit-btn, .off-btn, .on-btn { margin-right: 5px; padding: 4px 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; color: white; white-space: nowrap; }
.save-stock-btn { background: #67c23a; }
.edit-btn { background: #409eff; }
.off-btn { background: #f56c6c; }
.on-btn { background: #e6a23c; }
.save-stock-btn:hover { background: #85ce61; }
.edit-btn:hover { background: #66b1ff; }
.off-btn:hover { background: #f78989; }
.on-btn:hover { background: #f0c78e; }
.action-cell { white-space: nowrap; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal { background: white; padding: 24px; border-radius: 8px; width: 480px; max-width: 90%; }
.modal h3 { margin-bottom: 16px; color: #1f2937; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 14px; margin-bottom: 4px; color: #333; }
.form-group input, .form-group textarea { width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #409eff; box-shadow: 0 0 0 2px rgba(64,158,255,0.2); }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.cancel-btn { padding: 6px 16px; background: #ccc; border: none; border-radius: 4px; cursor: pointer; }
.confirm-btn { padding: 6px 16px; background: #409eff; color: white; border: none; border-radius: 4px; cursor: pointer; }
.cancel-btn:hover { background: #b3b3b3; }
.confirm-btn:hover { background: #337ecc; }
@media (max-width: 768px) { .book-manage-page { padding: 20px; } .table th, .table td { padding: 10px 8px; font-size: 12px; } .stock-input { width: 60px; } .save-stock-btn, .edit-btn, .off-btn, .on-btn { padding: 4px 6px; font-size: 11px; } }
</style>