<template>
  <div class="home-page">
    <h2 class="page-title">图书列表（可借阅）</h2>
    <!-- 修复：空值判断 -->
    <div class="empty-tip" v-if="bookList && bookList.length === 0">
      暂无可借阅图书，请联系管理员添加
    </div>
    <div class="book-list list" v-else-if="bookList">
      <!-- 图书项组件 -->
      <BookItem
        v-for="book in bookList"
        :key="book.id"
        :book="book"
        @borrow="handleBorrow"
      />
    </div>
  </div>
</template>

<script setup>
/**
 * 首页：展示图书列表，提供借阅功能
 * 修复点：1. 正确获取图书列表 2. 借阅方法传入当前用户ID 3. 空值判断
 */
import { ref, onMounted } from 'vue';
import { useBookStore } from '@/store/bookStore';
import { useUserStore } from '@/store/userStore'; // 新增：获取当前用户
import BookItem from '@/components/BookItem.vue';

// 初始化store
const bookStore = useBookStore();
const userStore = useUserStore();

// 核心修复：取store里正确的books属性，而非不存在的bookList
const bookList = ref([]);

/**
 * 初始化图书列表
 */
const initBookList = () => {
  bookList.value = bookStore.books || []; // 空值兜底
};

/**
 * 处理借阅图书（修复：传入当前用户ID + 图书ID）
 * @param {Number} bookId 图书ID
 */
const handleBorrow = (bookId) => {
  // 未登录时提示（路由守卫已控制，但做双重校验）
  if (!userStore.currentUser) {
    alert('请先登录！');
    return;
  }
  // 调用借阅方法，传入userId和bookId
  const { success, message } = bookStore.borrowBook(userStore.currentUser.id, bookId);
  alert(message);
  // 借阅后刷新图书列表（更新库存）
  initBookList();
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

.book-list {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 补充间距 */
}

.empty-tip {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 16px;
}
</style>