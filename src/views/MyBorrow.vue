<template>
  <div class="my-borrow-page">
    <h2 class="page-title">我的借阅记录</h2>
    <!-- 核心修复：先判断currentUserBorrows存在，再判断长度 -->
    <div class="empty-tip" v-if="currentUserBorrows && currentUserBorrows.length === 0">
      暂无未归还的借阅记录，可前往首页借阅图书
    </div>
    <!-- 借阅记录列表：仅当有数据时渲染 -->
    <div class="borrow-list list" v-else-if="currentUserBorrows">
      <BorrowItem
        v-for="borrow in currentUserBorrows"
        :key="borrow.id"
        :borrow="borrow"
        @return="handleReturn"
      />
    </div>
    <!-- 加载中提示（可选） -->
    <div class="loading-tip" v-else>
      加载中...
    </div>
  </div>
</template>

<script setup>
/**
 * 我的借阅页面：展示未归还的借阅记录，提供归还功能
 * 修复点：1. 正确获取当前用户ID 2. 调用方法获取借阅记录 3. 空值初始化 4. 响应式更新
 */
import { ref, onMounted } from 'vue';
import { useBookStore } from '@/store/bookStore';
import { useUserStore } from '@/store/userStore'; // 新增：获取当前用户
import BorrowItem from '@/components/BorrowItem.vue';

// 初始化store
const bookStore = useBookStore();
const userStore = useUserStore();

// 核心修复：初始化借阅记录为空数组，避免undefined
const currentUserBorrows = ref([]);

/**
 * 初始化当前用户的借阅记录
 */
const initUserBorrows = () => {
  // 未登录时直接返回空
  if (!userStore.currentUser) {
    currentUserBorrows.value = [];
    return;
  }
  // 调用store方法，传入当前用户ID获取借阅记录
  currentUserBorrows.value = bookStore.getCurrentUserBorrows(userStore.currentUser.id);
};

/**
 * 处理归还图书
 * @param {Number} borrowId 借阅记录ID
 */
const handleReturn = (borrowId) => {
  const { success, message } = bookStore.returnBook(borrowId);
  alert(message);
  // 归还后重新获取借阅记录
  initUserBorrows();
};

// 页面挂载时初始化数据
onMounted(() => {
  initUserBorrows();
});
</script>

<style scoped>
.my-borrow-page {
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

.empty-tip, .loading-tip {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 16px;
}

.borrow-list {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 补充间距，让列表更美观 */
}
</style>