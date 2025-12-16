<template>
  <div class="add-book-page">
    <h2 class="page-title">添加新书籍</h2>

    <!-- 增加库存区域 -->
    <div class="add-stock-form card">
      <h3>增加书籍库存</h3>
      <div class="form-item">
        <label>选择书籍：</label>
        <select v-model="selectedBookId" class="form-input">
          <option value="">请选择书籍</option>
          <option v-for="book in books" :value="book.id" :key="book.id">
            {{ book.name }} (当前库存: {{ book.stock }})
          </option>
        </select>
      </div>
      <div class="form-item">
        <label>增加数量：</label>
        <input
          v-model.number="addStockCount"
          type="number"
          min="1"
          placeholder="请输入增加的数量（≥1）"
          class="form-input"
        />
      </div>
      <button
        class="btn btn-success"
        @click="handleAddStock"
        :disabled="!selectedBookId || !addStockCount || addStockCount < 1"
      >
        增加库存
      </button>
    </div>

    <!-- 添加新书籍表单 -->
    <div class="add-book-form card">
      <div class="form-item">
        <label>书籍名称：</label>
        <input
          v-model="bookName"
          type="text"
          placeholder="请输入书籍名称"
          class="form-input"
        />
      </div>
      <div class="form-item">
        <label>书籍作者：</label>
        <input
          v-model="author"
          type="text"
          placeholder="请输入书籍作者"
          class="form-input"
        />
      </div>
      <div class="form-item">
        <label>书籍分类：</label>
        <select v-model="category" class="form-input">
          <option value="">请选择分类</option>
          <option value="小说">小说</option>
          <option value="科技">科技</option>
          <option value="历史">历史</option>
          <option value="教育">教育</option>
          <option value="其他">其他</option>
        </select>
      </div>
      <div class="form-item">
        <label>库存数量：</label>
        <input
          v-model.number="stock"
          type="number"
          min="1"
          placeholder="请输入库存数量（≥1）"
          class="form-input"
        />
      </div>
      <div class="form-item">
        <label>书籍简介：</label>
        <textarea
          v-model="description"
          placeholder="请输入书籍简介（选填）"
          class="form-textarea"
        ></textarea>
      </div>
      <button
        class="btn btn-primary submit-btn"
        @click="handleAddBook"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? '添加中...' : '确认添加' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBookStore } from '@/store/bookStore';
import { useRouter } from 'vue-router';

// 表单数据
const bookName = ref('');
const author = ref('');
const category = ref('');
const stock = ref(1);
const description = ref('');
const isSubmitting = ref(false);

// 库存相关变量
const selectedBookId = ref('');
const addStockCount = ref(1);
const bookStore = useBookStore();
const books = bookStore.books;
const router = useRouter();

// 表单验证
const validateForm = () => {
  if (!bookName.value.trim()) {
    alert('请输入书籍名称！');
    return false;
  }
  if (!author.value.trim()) {
    alert('请输入书籍作者！');
    return false;
  }
  if (!category.value) {
    alert('请选择书籍分类！');
    return false;
  }
  if (!stock.value || stock.value < 1) {
    alert('库存数量必须≥1！');
    return false;
  }
  return true;
};

// 处理添加书籍逻辑
const handleAddBook = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  try {
    const newBook = {
      id: bookStore.generateNewBookId(),
      name: bookName.value.trim(),
      author: author.value.trim(),
      category: category.value,
      stock: stock.value,
      description: description.value.trim() || '暂无简介',
      borrowCount: 0,
    };

    const { success, message } = bookStore.addBook(newBook);
    if (success) {
      alert(message);
      // 重置表单
      bookName.value = '';
      author.value = '';
      category.value = '';
      stock.value = 1;
      description.value = '';
    } else {
      alert(message);
    }
  } catch (error) {
    alert('添加书籍失败：' + error.message);
  } finally {
    isSubmitting.value = false;
  }
};

// 处理增加库存
const handleAddStock = () => {
  if (!selectedBookId.value) {
    alert('请选择书籍！');
    return;
  }

  if (!addStockCount.value || addStockCount.value < 1) {
    alert('增加数量必须≥1！');
    return;
  }

  const book = books.find(b => b.id === parseInt(selectedBookId.value));
  if (book) {
    book.stock += addStockCount.value;
    alert(`《${book.name}》库存已增加 ${addStockCount.value} 本，当前库存：${book.stock} 本`);

    // 重置表单
    selectedBookId.value = '';
    addStockCount.value = 1;
  }
};
</script>

<style scoped>
.add-book-page {
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

.add-stock-form,
.add-book-form {
  max-width: 600px;
  margin: 0 auto 30px;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.add-stock-form h3 {
  margin-top: 0;
  color: #67c23a;
  margin-bottom: 20px;
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

.form-input {
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.form-textarea {
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
}

.submit-btn, .btn-success {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}

.submit-btn {
  background: #409eff;
}

.btn-success {
  background: #67c23a;
}

.submit-btn:disabled, .btn-success:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background: #66b1ff;
}

.btn-success:hover:not(:disabled) {
  background: #52c41a;
}
</style>