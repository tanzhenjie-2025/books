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

    <!-- 统一表头和内容容器 -->
    <div class="history-container" v-else>
      <!-- 表头：新增作者列，调整6列占比 -->
      <div class="list-header">
        <div class="list-header-item col-name">图书名称</div>
        <div class="list-header-item col-author">作者</div>
        <div class="list-header-item col-time">借阅时间</div>
        <div class="list-header-item col-return">归还状态</div>
        <div class="list-header-item col-overdue">逾期状态</div>
        <div class="list-header-item col-action">操作</div>
      </div>
      <!-- 内容区域 -->
      <div class="list-content">
        <BorrowItem
          v-for="record in filteredRecords"
          :key="record.id"
          :borrow="record"
          @return="handleReturn"
        />
      </div>
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

  // 强制用户ID为数字
  const userIdNum = Number(userStore.currentUser.id);
  // 先加载书籍（确保ID类型统一）
  await bookStore.loadBooks();
  // 再加载借阅记录
  const loadResult = await bookStore.loadBorrowRecords(userIdNum);

  if (!loadResult.success) {
    alert(loadResult.message);
    return;
  }

  allRecords.value = bookStore.getAllUserBorrows(userIdNum);
  filterRecords();
};

// 筛选记录
const filterRecords = () => {
  if (statusFilter.value === 'all') {
    filteredRecords.value = [...allRecords.value];
  } else if (statusFilter.value === 'returned') {
    filteredRecords.value = allRecords.value.filter(r => r.isReturned);
  } else {
    filteredRecords.value = allRecords.value.filter(r => !r.isReturned);
  }
};

// 处理归还
const handleReturn = async (borrowId) => {
  if (!userStore.currentUser) {
    alert('请先登录');
    return;
  }

  const borrowIdNum = Number(borrowId);
  const userIdNum = Number(userStore.currentUser.id);

  try {
    const returnResult = await bookStore.returnBook(borrowIdNum, userIdNum);
    alert(returnResult.message);

    // 如果是认证错误，跳转到登录页
    if (returnResult.isAuthError) {
      userStore.logout(); // 清除无效的用户状态
      router.push('/login');
      return;
    }

    if (returnResult.success) {
      await initRecords();
    }
  } catch (error) {
    console.error('处理归还失败:', error);
    alert('操作失败，请稍后重试');
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

/* 容器：100%宽度，溢出隐藏 */
.history-container {
  width: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

/* 表头：100%宽度，flex布局，无额外边距 */
.list-header {
  display: flex;
  width: 100%;
  font-weight: bold;
  padding: 12px 0;
  background: #f9fafb;
  font-size: 14px;
  border-bottom: 1px solid #e4e7ed;
  box-sizing: border-box; /* 关键：内边距计入宽度 */
}

/* 表头列：统一样式 + 精准占比 + 对齐（6列总和100%） */
.list-header-item {
  box-sizing: border-box;
  padding: 0 10px; /* 统一内边距 */
  height: 100%;
  display: flex;
  align-items: center; /* 垂直居中 */
}
/* 每列精准占比 */
.col-name {
  width: 25%; /* 图书名称列 */
  justify-content: flex-start; /* 左对齐 */
}
.col-author {
  width: 15%; /* 作者列（新增） */
  justify-content: flex-start; /* 左对齐 */
}
.col-time {
  width: 20%; /* 借阅时间列 */
  justify-content: flex-start; /* 左对齐 */
}
.col-return {
  width: 15%; /* 归还状态列 */
  justify-content: center; /* 居中对齐 */
}
.col-overdue {
  width: 15%; /* 逾期状态列 */
  justify-content: center; /* 居中对齐 */
}
.col-action {
  width: 10%; /* 操作列（缩窄） */
  justify-content: center; /* 居中对齐 */
}

/* 内容区域：100%宽度 */
.list-content {
  width: 100%;
  background: #fff;
}

.empty-tip {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 16px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .list-header-item {
    font-size: 12px;
    padding: 0 5px;
  }
  .col-name { width: 22%; }
  .col-author { width: 13%; }
  .col-time { width: 20%; }
  .col-return { width: 15%; }
  .col-overdue { width: 15%; }
  .col-action { width: 15%; }
}
</style>