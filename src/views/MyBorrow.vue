<template>
  <div class="my-borrow-page">
    <h2 class="page-title">我的借阅记录</h2>
    <div class="empty-tip" v-if="currentUserBorrows.length === 0">
      暂无未归还的借阅记录，可前往首页借阅图书
    </div>
    <div class="borrow-list list" v-else>
      <BorrowItem
        v-for="borrow in currentUserBorrows"
        :key="borrow.id"
        :borrow="borrow"
        @return="handleReturn"
        @renew="handleRenew"
      />
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

// 初始化借阅记录（加载未归还的）
const initUserBorrows = async () => {
  if (!userStore.currentUser) {
    currentUserBorrows.value = [];
    return;
  }

  // 先加载书籍和借阅记录
  await bookStore.loadBooks();
  const loadResult = await bookStore.loadBorrowRecords(userStore.currentUser.id);

  if (loadResult.success) {
    // 获取未归还的借阅记录
    currentUserBorrows.value = bookStore.getBorrowRecordsWithOverdue.value.filter(
      record => !record.returned && record.userId === userStore.currentUser.id
    );
  } else {
    alert(loadResult.message);
  }
};

// 归还书籍（修复：传递userId）
const handleReturn = async (borrowId) => {

  const returnResult = await bookStore.returnBook(borrowId, userStore.currentUser.id);
  alert(returnResult.message);
  // 刷新数据
  await initUserBorrows();
};

// 续借书籍（新增实现）
const handleRenew = async (borrowId) => {
  if (!userStore.currentUser) {
    alert('请先登录！');
    return;
  }
  const renewResult = await bookStore.renewBook(borrowId, userStore.currentUser.id);
  alert(renewResult.message);
  // 刷新数据
  await initUserBorrows();
};

onMounted(async () => {
  await initUserBorrows();
});
</script>

<style scoped>
.my-borrow-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin: 20px;
}

.page-title {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
  font-size: 18px;
}

.empty-tip {
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