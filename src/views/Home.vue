<template>
  <div class="home-page">
    <h2 class="page-title">图书列表</h2>

    <!-- 搜索和筛选区域 -->
    <div class="search-filter card">
      <div class="search-box">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索图书名称或作者..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button class="btn btn-primary" @click="handleSearch">搜索</button>
      </div>

      <div class="filter-box">
        <label>分类筛选：</label>
        <select v-model="selectedCategory" @change="handleSearch">
          <option v-for="category in allCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
    </div>

    <!-- 图书列表 -->
    <div class="book-list">
      <BookItem
        v-for="book in paginatedBooks"
        :key="book.id"
        :book="book"
        @borrow="handleBorrow"
        @view-detail="handleViewDetail"
      />
    </div>

    <!-- 空状态提示 -->
    <div class="empty-tip" v-if="filteredBooks.length === 0">
      没有找到符合条件的图书
    </div>

    <!-- 分页组件 -->
    <Pagination
      :current-page="currentPage"
      :total-items="filteredBooks.length"
      :page-size="pageSize"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useBookStore } from '@/store/bookStore';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'vue-router';
import BookItem from '@/components/BookItem.vue';
import Pagination from '@/components/Pagination.vue';

// 初始化状态
const bookStore = useBookStore();
const userStore = useUserStore();
const router = useRouter();

// 搜索和筛选相关
const searchKeyword = ref('');
const selectedCategory = ref('全部');
const allCategories = bookStore.getAllCategories;
const filteredBooks = ref([]);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(5);
const paginatedBooks = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return filteredBooks.value.slice(startIndex, startIndex + pageSize.value);
});

// 初始化图书列表
const initBookList = () => {
  filteredBooks.value = bookStore.books;
};

// 处理搜索和筛选
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  filteredBooks.value = bookStore.searchBooks(searchKeyword.value, selectedCategory.value);
};

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page;
  // 滚动到顶部
  window.scrollTo(0, 0);
};

// 处理借阅
const handleBorrow = (bookId) => {
  if (!userStore.currentUser) {
    alert('请先登录！');
    return;
  }
  // 调用借阅方法，传入userId和bookId
  const { success, message } = bookStore.borrowBook(userStore.currentUser.id, bookId);
  alert(message);
  // 借阅后刷新图书列表（更新库存）
  initBookList();
  handleSearch();
};

// 查看图书详情
const handleViewDetail = (bookId) => {
  router.push(`/book-detail/${bookId}`);
};

// 页面挂载时初始化数据
onMounted(() => {
  initBookList();
});
</script>

<style scoped>
.home-page {
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

.search-filter {
  margin-bottom: 20px;
  padding: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 300px;
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.filter-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-box select {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.book-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.empty-tip {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 16px;
}
</style>