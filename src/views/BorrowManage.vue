<template>
  <div class="borrow-manage-page">
    <h2 class="page-title">借阅记录管理</h2>

    <!-- 借阅记录列表 -->
    <div class="borrow-list" v-if="allBorrowRecords.length > 0">
      <div class="borrow-item" v-for="record in allBorrowRecords" :key="record.id">
        <div class="borrow-info">
          <p>记录ID：{{ record.id }} | 用户ID：{{ record.userId }} | 书籍：{{ record.bookName }}</p>
          <p>借阅时间：{{ record.borrowTime }} | 状态：{{ record.isReturned ? '已归还' : '未归还' }}</p>
          <p v-if="record.overdue" class="overdue">超时状态：已超时{{ record.overdueDays }}天</p>
          <p v-else class="normal">超时状态：未超时</p>
        </div>
        <div class="borrow-actions">
          <button
            class="btn mark-btn"
            @click="handleMarkOverdue(record.id)"
            v-if="!record.isReturned && !record.overdue"
          >
            标记超时违规
          </button>
          <button
            class="btn return-btn"
            @click="handleForceReturn(record.id)"
            v-if="!record.isReturned"
          >
            强制归还
          </button>
        </div>
      </div>
    </div>
    <div class="empty-tip" v-else>暂无借阅记录</div>

    <!-- 违规处理区域 -->
    <h3 class="sub-title">违规记录处理</h3>
    <div class="violation-list" v-if="allViolationRecords.length > 0">
      <div class="violation-item" v-for="record in allViolationRecords" :key="record.id">
        <div class="violation-info">
          <p>违规ID：{{ record.id }} | 用户名：{{ record.username }} | 超时天数：{{ record.overdueDays }}天</p>
          <p>处理状态：{{ record.isHandled ? '已处理' : '未处理' }}</p>
        </div>
        <button
          class="btn handle-btn"
          @click="handleViolation(record.id)"
          v-if="!record.isHandled"
        >
          标记为已处理
        </button>
      </div>
    </div>
    <div class="empty-tip" v-else>暂无违规记录</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBookStore } from '@/store/bookStore';
import { useUserStore } from '@/store/userStore';

const bookStore = useBookStore();
const userStore = useUserStore();

const allBorrowRecords = ref([]);
const allViolationRecords = ref([]);

// 初始化数据
const initData = () => {
  allBorrowRecords.value = bookStore.getAllBorrowRecords();
  allViolationRecords.value = userStore.getAllViolationRecords();
};

// 标记超时违规
const handleMarkOverdue = (borrowId) => {
  const { success, message } = bookStore.markOverdueViolation(borrowId);
  alert(message);
  if (success) initData();
};

// 强制归还书籍
const handleForceReturn = (borrowId) => {
  if (!confirm('确定要强制归还该书籍吗？')) return;
  const { success, message } = bookStore.returnBook(borrowId);
  alert(message);
  if (success) initData();
};

// 处理违规记录
const handleViolation = (violationId) => {
  const { success, message } = userStore.handleViolation(violationId);
  alert(message);
  if (success) initData();
};

onMounted(() => {
  initData();
});
</script>

<style scoped>
.borrow-manage-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 80px);
}

.page-title {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}

.sub-title {
  margin: 30px 0 15px 0;
  color: #333;
  font-size: 18px;
}

.borrow-list, .violation-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.borrow-item, .violation-item {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.borrow-info p, .violation-info p {
  margin: 5px 0;
  color: #666;
}

.overdue {
  color: #f56c6c;
  font-weight: bold;
}

.normal {
  color: #67c23a;
}

.mark-btn {
  background: #e6a23c;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

.return-btn {
  background: #67c23a;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.handle-btn {
  background: #409eff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.empty-tip {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 16px;
  background: #fff;
  border-radius: 8px;
}
</style>