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

// 初始化Store
const bookStore = useBookStore();
const userStore = useUserStore();

// 响应式数据
const allRecords = ref([]);
const statusFilter = ref('all');
const filteredRecords = ref([]);

// 初始化借阅记录（修复核心bug）
const initRecords = async () => {
  // 未登录则清空
  if (!userStore.currentUser) {
    allRecords.value = [];
    filteredRecords.value = [];
    return;
  }

  // 先加载最新的借阅记录
  const loadResult = await bookStore.loadBorrowRecords(userStore.currentUser.id);
  if (!loadResult.success) {
    alert(loadResult.message);
    return;
  }

  // 获取用户所有借阅记录（调用修复后的方法）
  allRecords.value = bookStore.getAllUserBorrows(userStore.currentUser.id);
  // 初始化筛选
  filterRecords();
};

// 筛选记录
const filterRecords = () => {
  if (statusFilter.value === 'all') {
    filteredRecords.value = [...allRecords.value];
  } else if (statusFilter.value === 'returned') {
    // 匹配后端字段：returned → 前端显示用isReturned兼容
    filteredRecords.value = allRecords.value.filter(r => r.returned || r.isReturned);
  } else {
    filteredRecords.value = allRecords.value.filter(r => !(r.returned || r.isReturned));
  }
};

// 处理归还（修复异步调用）
const handleReturn = async (borrowId) => {
  if (!userStore.currentUser) {
    alert('请先登录');
    return;
  }
  // 调用归还方法（传递recordId和userId）
  const returnResult = await bookStore.returnBook(borrowId, userStore.currentUser.id);
  alert(returnResult.message);
  // 归还成功后刷新记录
  if (returnResult.success) {
    await initRecords();
  }
};

// 页面挂载时初始化
onMounted(async () => {
  // 先加载书籍（关联书籍名称）
  await bookStore.loadBooks();
  // 再加载借阅记录
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