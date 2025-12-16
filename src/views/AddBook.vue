<template>
  <div class="add-book-page card">
    <h2 class="page-title">添加书籍</h2>

    <!-- 添加书籍表单 -->
    <div class="add-book-form">
      <div class="form-item">
        <label>书籍名称：</label>
        <div class="input-wrap">
          <input
            v-model="newBook.name"
            placeholder="请输入书籍名称"
            maxlength="50"
          />
        </div>
      </div>
      <div class="form-item">
        <label>作者：</label>
        <div class="input-wrap">
          <input
            v-model="newBook.author"
            placeholder="请输入作者名称"
            maxlength="30"
          />
        </div>
      </div>
      <div class="form-item">
        <label>分类：</label>
        <div class="input-wrap">
          <input
            v-model="newBook.category"
            placeholder="例如：小说、科技、历史"
            maxlength="20"
          />
        </div>
      </div>
      <div class="form-item">
        <label>出版社：</label>
        <div class="input-wrap">
          <input
            v-model="newBook.publish"
            placeholder="请输入出版社名称"
            maxlength="30"
          />
        </div>
      </div>
      <div class="form-item">
        <label>库存：</label>
        <div class="input-wrap">
          <input
            v-model.number="newBook.stock"
            type="number"
            min="1"
            placeholder="请输入库存数量"
          />
          <span class="form-tip">最少1本</span>
        </div>
      </div>
      <div class="form-item">
        <label>简介：</label>
        <div class="input-wrap">
          <textarea
            v-model="newBook.description"
            placeholder="请输入书籍简介（选填）"
            rows="3"
            style="min-height: 80px;"
          ></textarea>
        </div>
      </div>
      <div class="form-submit">
        <button class="btn btn-primary" @click="addBook">
          <span class="icon">📚</span>添加书籍
        </button>
        <button class="btn" style="background: #f5f7fa;" @click="resetForm">
          <span class="icon">🔄</span>重置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBookStore } from '@/store/bookStore';
import { useRouter } from 'vue-router';

const bookStore = useBookStore();
const router = useRouter();

// 新书籍表单数据
const newBook = ref({
  name: '',
  author: '',
  category: '',
  publish: '',
  stock: 1,
  description: ''
});

// 添加书籍
const addBook = () => {
  // 表单验证
  if (!newBook.value.name.trim()) {
    alert('请输入书籍名称！');
    return;
  }
  if (!newBook.value.author.trim()) {
    alert('请输入作者名称！');
    return;
  }
  if (!newBook.value.category.trim()) {
    alert('请输入书籍分类！');
    return;
  }
  if (!newBook.value.stock || newBook.value.stock < 1) {
    alert('库存数量必须大于0！');
    return;
  }

  // 构造书籍数据
  const bookData = {
    id: Date.now().toString(),
    borrowCount: 0, // 初始借阅次数0
    ...newBook.value
  };

  // 调用store添加书籍
  const { success, message } = bookStore.addBook(bookData);
  alert(message);
  if (success) {
    router.push('/home'); // 添加成功返回首页
  }
};

// 重置表单
const resetForm = () => {
  newBook.value = {
    name: '',
    author: '',
    category: '',
    publish: '',
    stock: 1,
    description: ''
  };
};
</script>

<style scoped>
.add-book-page {
  padding: 25px;
}

.add-book-form {
  background: var(--bg-secondary);
  padding: 25px;
  border-radius: 8px;
  box-shadow: var(--shadow);
}

/* 适配小屏幕 */
@media (max-width: 768px) {
  .form-submit {
    padding-left: 80px;
    flex-direction: column;
  }
  .form-submit .btn {
    width: 100%;
  }
}
</style>