<template>
  <div class="my-borrow-page">
    <h2 class="page-title">我的借阅记录</h2>
    <div class="empty-tip" v-if="currentUserBorrows && currentUserBorrows.length === 0">
      暂无未归还的借阅记录，可前往首页借阅图书
    </div>
    <div class="borrow-list list" v-else-if="currentUserBorrows">
      <BorrowItem
        v-for="borrow in currentUserBorrows"
        :key="borrow.id"
        :borrow="borrow"
        @return="handleReturn"
        @renew="handleRenew"
      />
    </div>
    <div class="loading-tip" v-else>
      加载中...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBookStore } from '../store/bookStore';
import { useUserStore } from '../store/userStore';
import BorrowItem from '../components/BorrowItem.vue';

const bookStore = useBookStore();
const userStore = useUserStore();
const currentUserBorrows = ref([]);

// 初始化借阅记录
const initUserBorrows = () => {
  if (!userStore.currentUser) {
    currentUserBorrows.value = [];
    return;
  }
  currentUserBorrows.value = bookStore.getCurrentUserBorrows(userStore.currentUser.id);
};

// 归还书籍
const handleReturn = (borrowId) => {
  const { success, message } = bookStore.returnBook(borrowId);
  alert(message);
  initUserBorrows();
};

// 续借书籍
const handleRenew = (borrowId) => {
  const { success, message } = bookStore.renewBook(borrowId);
  alert(message);
  initUserBorrows();
};

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
  gap: 10px;
}
</style>