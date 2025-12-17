<template>
  <div class="book-manage-page">
    <h2 class="page-title">书籍添加（管理员专属）</h2>

    <!-- 操作按钮 -->
    <div class="manage-actions">
      <button class="btn-primary" @click="$router.push('/add-book')">
        添加新书籍
      </button>
    </div>

    <!-- 书籍管理表格（支持修改库存） -->
    <div class="book-manage-table" v-if="bookStore.books.length > 0">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>书名</th>
            <th>作者</th>
            <th>分类</th>
            <th>出版社</th>
            <th>当前库存</th>
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
            <td>{{ book.borrowCount || 0 }}</td>
            <td>
              <button
                class="update-stock-btn"
                @click="handleUpdateStock(book.id)"
              >
                保存库存
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空数据提示 -->
    <div class="empty-tip" v-if="bookStore.books.length === 0">
      暂无书籍，请先添加书籍！
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useBookStore} from '../store/bookStore';

const bookStore = useBookStore();

// 库存修改表单（key: bookId, value: stock）
const stockForm = ref({});

// 初始化库存表单
const initStockForm = () => {
  bookStore.books.forEach(book => {
    stockForm.value[book.id] = book.stock;
  });
};

// 失去焦点时恢复原值（未保存的情况下）
const handleStockBlur = (bookId) => {
  // 如果输入的值为空/非数字，恢复原值
  const book = bookStore.books.find(b => b.id === bookId);
  if (!book) return;

  if (stockForm.value[bookId] === '' || isNaN(stockForm.value[bookId])) {
    stockForm.value[bookId] = book.stock;
  }
};

// 保存库存修改（改为异步方法，正确处理返回结果）
const handleUpdateStock = async (bookId) => {
  try {
    const newStock = Number(stockForm.value[bookId]);
    // 调用新增的库存更新方法
    const res = await bookStore.updateBookStock(bookId, newStock);
    alert(res.message);

    // 成功后重新初始化表单
    if (res.success) {
      initStockForm();
    }
  } catch (error) {
    console.error('保存库存失败:', error);
    alert('保存库存失败：' + error.message);
  }
};

// 页面挂载时初始化（先加载书籍，再初始化表单）
onMounted(async () => {
  // 先加载最新的书籍列表
  await bookStore.loadBooks();
  // 再初始化库存表单
  initStockForm();
});
</script>

<style scoped>
.book-manage-page {
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

.manage-actions {
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

/* 书籍管理表格 */
.book-manage-table {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.table thead {
  background-color: #f9fafb;
}

.table th, .table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e4e7ed;
}

.table th {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
}

.table td {
  font-size: 14px;
  color: #4b5563;
}

/* 库存输入框 */
.stock-input {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  text-align: center;
}

.stock-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 保存库存按钮 */
.update-stock-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background-color: #67c23a;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.update-stock-btn:hover {
  background-color: #85ce61;
}

/* 空数据提示 */
.empty-tip {
  text-align: center;
  padding: 50px;
  font-size: 16px;
  color: #9ca3af;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #e4e7ed;
  margin-top: 20px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .book-manage-page {
    padding: 20px;
  }

  .table th, .table td {
    padding: 10px 8px;
    font-size: 12px;
  }

  .stock-input {
    width: 60px;
  }

  .update-stock-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>