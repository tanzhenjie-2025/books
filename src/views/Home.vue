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
          <button
            @click="handleBorrow(book.id)"
            :disabled="book.stock <= 0"
            class="borrow-btn">
            {{ book.stock <= 0 ? '库存不足' : '借阅' }}
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

// 初始化加载书籍
onMounted(async () => {
  await bookStore.loadBooks();
});

// 退出登录
const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};

// 借阅书籍
const handleBorrow = async (bookId) => {
  const userId = userStore.currentUser.id;
  const result = await bookStore.borrowBook(userId, bookId);

  if (result.success) {
    alert(result.message);
  } else {
    alert(result.message);
  }
};
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logout-btn, .user-btn, .admin-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn {
  background-color: #f56c6c;
  color: white;
}

.user-btn {
  background-color: #409eff;
  color: white;
}

.admin-btn {
  background-color: #67c23a;
  color: white;
}

.book-list {
  margin-top: 20px;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.book-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.borrow-btn {
  width: 100%;
  padding: 8px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.borrow-btn:disabled {
  background-color: #909399;
  cursor: not-allowed;
}
</style>