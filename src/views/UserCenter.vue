<template>
  <div class="user-center">
    <div class="header">
      <h1>个人中心</h1>
      <button @click="router.push('/home')" class="back-btn">返回首页</button>
    </div>

    <div class="user-profile">
      <h2>个人信息</h2>
      <p>用户名：{{ userStore.currentUser.username }}</p>
      <p>账号状态：{{ userStore.currentUser.enabled ? '正常' : '禁用' }}</p>
      <p>违规次数：{{ userStore.currentUser.violationCount }}/3</p>
    </div>

    <div class="borrow-records">
      <h2>我的借阅</h2>
      <table>
        <thead>
          <tr>
            <th>书籍名称</th>
            <th>作者</th>
            <th>借阅时间</th>
            <th>状态</th>
            <th>逾期天数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in bookStore.getBorrowRecordsWithOverdue" :key="record.id">
            <td>{{ record.bookName }}</td>
            <td>{{ record.bookAuthor }}</td>
            <td>{{ formatDate(record.borrowTime) }}</td>
            <td :class="record.returned ? 'returned' : record.overdue ? 'overdue' : 'borrowing'">
              {{ record.returned ? '已归还' : record.overdue ? '逾期' : '借阅中' }}
            </td>
            <td>{{ record.overdueDays }}</td>
            <td>
              <button
                @click="handleReturn(record.id)"
                :disabled="record.returned"
                class="return-btn">
                {{ record.returned ? '已归还' : '归还' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="bookStore.borrowRecords.length === 0" class="no-data">暂无借阅记录</p>
    </div>

    <div class="violations">
      <h2>违规记录</h2>
      <table v-if="bookStore.violations.length > 0">
        <thead>
          <tr>
            <th>违规日期</th>
            <th>原因</th>
            <th>逾期天数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vio in bookStore.violations" :key="vio.id">
            <td>{{ formatDate(vio.violationDate) }}</td>
            <td>{{ vio.reason }}</td>
            <td>{{ vio.overdueDays }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="no-data">暂无违规记录</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { useBookStore } from '@/store/bookStore';

const router = useRouter();
const userStore = useUserStore();
const bookStore = useBookStore();
const userId = userStore.currentUser.id;

// 格式化日期（兼容后端返回的LocalDate格式）
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // 处理后端返回的 yyyy-MM-dd 格式
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// 初始化加载数据
onMounted(async () => {
  await bookStore.loadBooks();
  await bookStore.loadBorrowRecords(userId);
  await bookStore.loadViolations(userId);
});

// 归还书籍
const handleReturn = async (recordId) => {
  if (!confirm('确认归还该书籍吗？')) return;

  const result = await bookStore.returnBook(recordId, userId);
  if (result.success) {
    alert(result.message);
  } else {
    alert(result.message);
  }
};
</script>

<style scoped>
.user-center {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.back-btn {
  padding: 8px 15px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.user-profile {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.borrow-records, .violations {
  margin-bottom: 30px;
}

table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #eee;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
}

.returned {
  color: #67c23a;
}

.overdue {
  color: #f56c6c;
  font-weight: bold;
}

.borrowing {
  color: #409eff;
}

.return-btn {
  padding: 5px 10px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.return-btn:disabled {
  background-color: #909399;
  cursor: not-allowed;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #909399;
}
</style>