<template>
  <div class="home-container">
    <div class="header">
      <h1>图书借阅管理系统</h1>
      <div class="user-info">
        <span>欢迎：{{ userStore.currentUser.username }}</span>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
        <button @click="router.push('/user')" class="user-btn">个人中心</button>
        <button v-if="userStore.currentUser.role === 'ROLE_ADMIN'"
                @click="router.push('/admin')" class="admin-btn">
          管理员面板
        </button>
      </div>
    </div>

    <div class="book-list">
      <h2>图书列表</h2>
      <div class="book-grid">
        <div v-for="book in bookStore.books" :key="book.id" class="book-card">
          <h3>{{ book.name }}</h3>
          <p>作者：{{ book.author }}</p>
          <p>分类：{{ book.category }}</p>
          <p>库存：{{ book.stock }}</p>
          <p>借阅次数：{{ book.borrowCount }}</p>
          <p>评分：{{ book.avgScore || 0 }} ({{ book.commentCount || 0 }}条评价)</p>
          <button
            @click="handleBorrow(book.id)"
            :disabled="book.stock <= 0"
            class="borrow-btn">
            {{ book.stock <= 0 ? '库存不足' : '借阅' }}
          </button>
          <button
            @click="handleComment(book.id)"
            class="comment-btn">
            评价
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { useBookStore } from '@/store/bookStore';

const router = useRouter();
const userStore = useUserStore();
const bookStore = useBookStore();

// 处理借阅
const handleBorrow = async (bookId) => {
  if (!userStore.currentUser) {
    alert('请先登录！');
    return;
  }

  const { success, message } = await bookStore.borrowBook(
    userStore.currentUser.id,
    bookId
  );
  alert(message);
};

// 处理评价
const handleComment = (bookId) => {
  router.push(`/book-comments/${bookId}`);
};

// 处理退出登录
const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};

onMounted(async () => {
  await bookStore.loadBooks();
});
</script>

<style scoped>
/* 原有样式保持不变，添加以下样式 */
.book-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.comment-btn {
  padding: 8px 0;
  border: none;
  border-radius: 6px;
  background-color: #67c23a;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 4px;
}

.comment-btn:hover {
  background-color: #52c41a;
}
</style>