<template>
  <div class="add-book-page">
    <h2 class="page-title">添加新书籍</h2>
    <div class="add-book-form card">
      <div class="form-item">
        <label>书名：</label>
        <input v-model="newBook.name" placeholder="请输入书名" />
      </div>
      <div class="form-item">
        <label>作者：</label>
        <input v-model="newBook.author" placeholder="请输入作者" />
      </div>
      <div class="form-item">
        <label>分类：</label>
        <input v-model="newBook.category" placeholder="请输入分类（如：科技/文学）" />
      </div>
      <div class="form-item">
        <label>出版社：</label>
        <input v-model="newBook.publish" placeholder="请输入出版社" />
      </div>
      <div class="form-item">
        <label>库存：</label>
        <input v-model.number="newBook.stock" type="number" min="1" placeholder="请输入库存数量" />
      </div>
      <div class="form-item">
        <label>简介：</label>
        <textarea v-model="newBook.description" placeholder="请输入书籍简介"></textarea>
      </div>
      <button class="btn btn-success" @click="handleAddBook">添加书籍</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBookStore } from '../store/bookStore';
import { useRouter } from 'vue-router';

const bookStore = useBookStore();
const router = useRouter();

// 新书籍表单数据（移除了id字段，borrowCount后端默认0无需前端传）
const newBook = ref({
  name: '',
  author: '',
  category: '',
  publish: '',
  stock: 1,
  description: ''
});

// 添加书籍（修改为async函数，处理异步调用）
const handleAddBook = async () => {
  // 基础校验
  if (!newBook.value.name || !newBook.value.author) {
    alert('书名和作者不能为空！');
    return;
  }
  if (newBook.value.stock < 1) {
    alert('库存数量不能小于1！');
    return;
  }

  // 异步调用添加书籍方法（关键：加await）
  const { success, message } = await bookStore.addBook({ ...newBook.value });
  alert(message);

  if (success) {
    router.push('/book-manage');
  }
};
</script>

<style scoped>
.add-book-page {
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

.add-book-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-item {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  color: #666;
}

.form-item input,
.form-item textarea {
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.form-item textarea {
  min-height: 100px;
  resize: vertical;
}

.btn-success {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #67c23a;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
}

.btn-success:hover {
  background: #85ce61;
}
</style>