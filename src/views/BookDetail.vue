<template>
  <div class="book-detail-page">
    <button class="btn btn-primary back-btn" @click="$router.back()">返回</button>
    <div class="book-detail card" v-if="book">
      <h2 class="book-title">{{ book.name }}</h2>
      <div class="book-info">
        <p><strong>作者：</strong>{{ book.author }}</p>
        <p><strong>分类：</strong>{{ book.category }}</p>
        <p><strong>库存：</strong>{{ book.stock }} 本</p>
        <p><strong>借阅次数：</strong>{{ book.borrowCount }} 次</p>
        <p><strong>简介：</strong>{{ book.description }}</p>
      </div>
      <button
        class="btn btn-primary borrow-btn"
        @click="handleBorrow"
        :disabled="!canBorrow"
      >
        {{ book.stock > 0 ? '立即借阅' : '库存不足' }}
      </button>
    </div>
    <div class="empty-tip" v-else>
      图书信息不存在
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useBookStore } from '@/store/bookStore';
import { useUserStore } from '@/store/userStore';

const route = useRoute();
const bookStore = useBookStore();
const userStore = useUserStore();
const book = ref(null);
const canBorrow = ref(false);

const initBook = () => {
  const bookId = parseInt(route.params.id);
  book.value = bookStore.books.find(b => b.id === bookId) || null;

  // 判断是否可以借阅
  canBorrow.value = book.value?.stock > 0 && !!userStore.currentUser;
};

const handleBorrow = () => {
  if (!userStore.currentUser) {
    alert('请先登录！');
    return;
  }

  const { success, message } = bookStore.borrowBook(
    userStore.currentUser.id,
    book.value.id
  );
  alert(message);
  if (success) {
    initBook(); // 刷新图书信息
  }
};

onMounted(initBook);
</script>

<style scoped>
.book-detail-page {
  padding: 20px;
}

.back-btn {
  margin-bottom: 20px;
}

.book-detail {
  max-width: 800px;
  margin: 0 auto;
}

.book-title {
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.book-info {
  margin-bottom: 30px;
  line-height: 1.8;
  font-size: 16px;
}

.borrow-btn {
  display: block;
  margin: 0 auto;
  padding: 10px 20px;
  font-size: 16px;
}
</style>