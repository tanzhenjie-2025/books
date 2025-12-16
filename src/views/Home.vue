<template>
  <div class="home-page card">
    <h2 class="page-title">图书列表（可借阅）</h2>

    <!-- 搜索框 -->
    <div class="search-box">
      <input
        v-model="searchKeyword"
        placeholder="搜索图书名称或作者..."
        class="search-input"
        @input="handleSearch"
      />
      <button class="btn btn-primary search-btn">
        <span class="icon">🔍</span>搜索
      </button>
    </div>

    <!-- 空状态 -->
    <div class="empty-tip" v-if="filteredBooks.length === 0">
      暂无可借阅图书，请联系管理员添加
    </div>

    <!-- 图书列表 -->
    <div class="book-list list" v-else>
      <transition-group name="slide" tag="div">
        <BookItem
          v-for="book in filteredBooks"
          :key="book.id"
          :book="book"
          @borrow="handleBorrow"
        />
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useBookStore } from '@/store/bookStore';
import { useUserStore } from '@/store/userStore';
import BookItem from '@/components/BookItem.vue';

const bookStore = useBookStore();
const userStore = useUserStore();
const bookList = ref([]);
const searchKeyword = ref('');

// 初始化图书列表
const initBookList = () => {
  bookList.value = bookStore.books || [];
};

// 搜索过滤
const filteredBooks = computed(() => {
  if (!searchKeyword.value.trim()) return bookList.value;
  const keyword = searchKeyword.value.toLowerCase().trim();
  return bookList.value.filter(book =>
    book.name.toLowerCase().includes(keyword) ||
    book.author.toLowerCase().includes(keyword)
  );
});

// 借阅处理
const handleBorrow = (bookId) => {
  if (!userStore.currentUser) {
    alert('请先登录！');
    return;
  }
  const { success, message } = bookStore.borrowBook(userStore.currentUser.id, bookId);
  alert(message);
  initBookList();
};

// 搜索处理
const handleSearch = (e) => {
  // 搜索逻辑由computed自动处理
};

onMounted(() => {
  initBookList();
});
</script>

<style scoped>
.home-page {
  padding: 25px;
}

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
}

.search-btn {
  white-space: nowrap;
}

.book-list {
  gap: 12px;
}

@media (max-width: 768px) {
  .search-box {
    flex-direction: column;
  }
  .search-btn {
    width: 100%;
  }
}
</style>