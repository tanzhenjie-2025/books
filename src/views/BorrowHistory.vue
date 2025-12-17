<template>
  <div class="borrow-history-page">
    <h2 class="page-title">借阅历史记录</h2>

    <div class="filter-bar">
      <select v-model="statusFilter" @change="filterRecords">
        <option value="all">全部记录</option>
        <option value="returned">已归还</option>
        <option value="unreturned">未归还</option>
      </select>
    </div>

    <div class="empty-tip" v-if="filteredRecords.length === 0">
      暂无借阅记录
    </div>

    <div class="history-list list" v-else>
      <div class="list-header">
        <div class="list-header-item">图书名称</div>
        <div class="list-header-item">借阅时间</div>
        <div class="list-header-item">归还状态</div>
        <div class="list-header-item">逾期状态</div>
        <div class="list-header-item">操作</div>
      </div>
      <BorrowItem
        v-for="record in filteredRecords"
        :key="record.id"
        :borrow="record"
        @return="handleReturn"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBookStore } from '@/store/bookStore';
import { useUserStore } from '@/store/userStore';
import BorrowItem from '@/components/BorrowItem.vue';

const bookStore = useBookStore();
const userStore = useUserStore();

const allRecords = ref([]);
const statusFilter = ref('all');
const filteredRecords = ref([]);

// 初始化借阅记录
const initRecords = async () => {
  if (!userStore.currentUser) {
    allRecords.value = [];
    filteredRecords.value = [];
    return;
  }

  // 先确保书籍列表已加载（核心修正）
  await bookStore.loadBooks();
  // 再加载借阅记录
  const loadResult = await bookStore.loadBorrowRecords(userStore.currentUser.id);
  if (!loadResult.success) {
    alert(loadResult.message);
    return;
  }

  allRecords.value = bookStore.getAllUserBorrows(userStore.currentUser.id);
  filterRecords();
};

// 筛选记录（修正：用isReturned判断）
const filterRecords = () => {
  if (statusFilter.value === 'all') {
    filteredRecords.value = [...allRecords.value];
  } else if (statusFilter.value === 'returned') {
    filteredRecords.value = allRecords.value.filter(r => r.isReturned);
  } else {
    filteredRecords.value = allRecords.value.filter(r => !r.isReturned);
  }
};

// 处理归还（简化逻辑，依赖store内部的刷新顺序）
const handleReturn = async (borrowId) => {
  if (!userStore.currentUser) {
    alert('请先登录');
    return;
  }
  const returnResult = await bookStore.returnBook(borrowId, userStore.currentUser.id);
  alert(returnResult.message);
  if (returnResult.success) {
    await initRecords(); // 重新初始化记录（已包含先加载书籍的逻辑）
  }
};

// 页面挂载时初始化
onMounted(async () => {
  await initRecords();
});
</script>

<style scoped>
.borrow-history-page {
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

.filter-bar {
  margin-bottom: 20px;
}

.filter-bar select {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.list-header {
  display: flex;
  font-weight: bold;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px 4px 0 0;
  font-size: 14px;
}

.list-header-item {
  flex: 1;
  text-align: left;
  padding: 0 8px;
}

.history-list {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.empty-tip {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 16px;
}
</style>