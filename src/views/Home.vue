<template>
  <div class="home-container">
    <div class="header">
      <h1>图书借阅管理系统</h1>
      <div class="user-info">
        <span>欢迎：{{ userStore.currentUser.username }}</span>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
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
          <!-- 修复：修正enabled判断逻辑 + 管理员豁免 -->
          <button
            @click="handleBorrow(book.id)"
            :disabled="getBorrowBtnDisabledStatus(book)"
            class="borrow-btn">
            {{ getBorrowBtnText(book) }}
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
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { useBookStore } from '@/store/bookStore';

const router = useRouter();
const userStore = useUserStore();
const bookStore = useBookStore();

// 计算属性：获取当前用户的启用状态（处理类型和默认值）
const currentUserEnabled = computed(() => {
  // 不存在则默认启用，处理字符串/布尔值类型
  const enabled = userStore.currentUser?.enabled;
  if (enabled === undefined || enabled === null) return true;
  return typeof enabled === 'string' ? enabled === 'true' : !!enabled;
});

// 计算属性：判断当前用户是否是管理员
const isAdmin = computed(() => {
  return userStore.currentUser?.role === 'ROLE_ADMIN';
});

// 方法：获取借阅按钮禁用状态
const getBorrowBtnDisabledStatus = (book) => {
  // 未登录
  if (!userStore.currentUser) return true;
  // 库存不足
  if (book.stock <= 0) return true;
  // 管理员不受限制
  if (isAdmin.value) return false;
  // 账号明确被禁用（修复：判断逻辑修正）
  if (!currentUserEnabled.value) return true;
  // 违规次数≥3次
  if (userStore.currentUser.violationCount >= 3) return true;
  // 其他情况可借阅
  return false;
};

// 方法：获取借阅按钮显示文字
const getBorrowBtnText = (book) => {
  if (!userStore.currentUser) return '请先登录';
  if (isAdmin.value) return book.stock > 0 ? '借阅' : '库存不足';
  if (!currentUserEnabled.value) return '账号已禁用';
  if (userStore.currentUser.violationCount >= 3) return '违规次数过多';
  return book.stock > 0 ? '借阅' : '库存不足';
};

// 处理借阅（修复：完善判断逻辑）
const handleBorrow = async (bookId) => {
  if (!userStore.currentUser) {
    alert('请先登录！');
    return;
  }

  // 管理员不受限制
  if (isAdmin.value) {
    const { success, message } = await bookStore.borrowBook(
      userStore.currentUser.id,
      bookId
    );
    alert(message);
    return;
  }

  // 检查账号是否禁用（修复：使用处理后的启用状态）
  if (!currentUserEnabled.value) {
    alert('您的账号已被禁用，无法借阅书籍！');
    return;
  }

  // 检查违规次数
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
/* 样式部分保持不变 */
.home-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

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

.book-list h2 {
  color: #1f2937;
  margin-bottom: 20px;
}

.book-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.book-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #f9fafb;
  box-sizing: border-box;
  flex: 1 1 calc(33.333% - 24px);
  max-width: calc(33.333% - 24px);
  min-width: 280px;
  height: 100%;
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