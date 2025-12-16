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
import { ref, onMounted, computed } from 'vue';
import { useBookStore } from '@/store/bookStore';
import { useUserStore } from '@/store/userStore';
import BorrowItem from '@/components/BorrowItem.vue';

const bookStore = useBookStore();
const userStore = useUserStore();
const allRecords = ref([]);
const statusFilter = ref('all');
const filteredRecords = ref([]);

const initRecords = () => {
  if (!userStore.currentUser) {
    allRecords.value = [];
    return;
  }

  // 获取用户所有借阅记录（包括已归还）
  allRecords.value = bookStore.getAllUserBorrows(userStore.currentUser.id);
  filterRecords();
};

const filterRecords = () => {
  if (statusFilter.value === 'all') {
    filteredRecords.value = [...allRecords.value];
  } else if (statusFilter.value === 'returned') {
    filteredRecords.value = allRecords.value.filter(r => r.isReturned);
  } else {
    filteredRecords.value = allRecords.value.filter(r => !r.isReturned);
  }
};

const handleReturn = (borrowId) => {
  const { success, message } = bookStore.returnBook(borrowId);
  alert(message);
  if (success) {
    initRecords();
  }
};

onMounted(initRecords);
</script>

<style scoped>
.borrow-history-page {
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

.filter-bar {
  margin-bottom: 20px;
}

.filter-bar select {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.list-header {
  display: flex;
  font-weight: bold;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px 4px 0 0;
}

.list-header-item {
  flex: 1;
  text-align: left;
}

.empty-tip {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 16px;
}
</style>