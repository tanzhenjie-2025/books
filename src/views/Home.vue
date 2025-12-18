<template>
  <div class="home-container">
    <div class="header">
      <h1>图书借阅管理系统</h1>
      <div class="user-info">
        <span>欢迎：{{ userStore.currentUser.username }}</span>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
<!--        <button @click="router.push('/user')" class="user-btn">个人中心</button>-->
        <button v-if="userStore.currentUser.role === 'ROLE_ADMIN'"
                @click="router.push('/admin')" class="admin-btn">
          管理员面板
        </button>
      </div>
    </div>

    <div class="book-list">
      <h2>图书列表</h2>
      <!-- 核心修改：给 book-grid 加布局样式，实现多列展示 -->
      <div class="book-grid">
        <div v-for="book in bookStore.books" :key="book.id" class="book-card">
          <h3>{{ book.name }}</h3>
          <p>作者：{{ book.author }}</p>
          <p>分类：{{ book.category }}</p>
          <p>库存：{{ book.stock }}</p>
          <p>借阅次数：{{ book.borrowCount }}</p>
          <p>评分：{{ book.avgScore || 0 }} ({{ book.commentCount || 0 }}条评价)</p>
          <!-- 关键修改：借阅按钮禁用逻辑+文字适配违规次数 -->
          <button
            @click="handleBorrow(book.id)"
            :disabled="book.stock <= 0 || userStore.currentUser?.violationCount >= 3"
            class="borrow-btn">
            {{ userStore.currentUser?.violationCount >= 3
              ? '违规次数过多'
              : (book.stock <= 0 ? '库存不足' : '借阅') }}
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

// 处理借阅（关键修改：加入违规次数检查）
const handleBorrow = async (bookId) => {
  if (!userStore.currentUser) {
    alert('请先登录！');
    return;
  }

  // 关键新增：前置检查违规次数
  if (userStore.currentUser.violationCount >= 3) {
    alert('您的违规次数已达3次，暂不能借阅书籍！');
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
/* 全局容器样式 */
.home-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

/* 头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0;
  color: #1f2937;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn, .user-btn, .admin-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.logout-btn {
  background-color: #f56565;
  color: white;
}

.logout-btn:hover {
  background-color: #ef4444;
}

.user-btn {
  background-color: #409eff;
  color: white;
}

.user-btn:hover {
  background-color: #3399ff;
}

.admin-btn {
  background-color: #67c23a;
  color: white;
}

.admin-btn:hover {
  background-color: #52c41a;
}

/* 图书列表区域 */
.book-list h2 {
  color: #1f2937;
  margin-bottom: 20px;
}

/* 核心修改：图书网格布局 - 实现多列展示 */
.book-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px; /* 卡片之间的间距 */
}

/* 核心修改：控制单个图书卡片宽度，实现一行多个 */
.book-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #f9fafb;
  box-sizing: border-box;
  /* 关键：控制宽度，默认一行3列，减去间距 */
  flex: 1 1 calc(33.333% - 24px);
  max-width: calc(33.333% - 24px);
  min-width: 280px; /* 最小宽度，防止缩得太窄 */
  height: 100%; /* 确保同列卡片高度一致 */
}

.book-card h3 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 18px;
}

.book-card p {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
}

/* 借阅按钮样式 */
.borrow-btn {
  padding: 8px 0;
  border: none;
  border-radius: 6px;
  background-color: #409eff;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 8px;
}

.borrow-btn:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.borrow-btn:hover:not(:disabled) {
  background-color: #3399ff;
}

/* 评论按钮样式 */
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

/* 响应式适配：不同屏幕宽度调整列数 */
@media (max-width: 1200px) {
  .book-card {
    flex: 1 1 calc(50% - 24px);
    max-width: calc(50% - 24px);
  }
}

@media (max-width: 768px) {
  .book-card {
    flex: 1 1 100%;
    max-width: 100%;
  }

  .header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .user-info {
    flex-wrap: wrap;
  }
}
</style>