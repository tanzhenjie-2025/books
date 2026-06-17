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

    <div class="history-container" v-else>
      <div class="list-header">
        <div class="list-header-item col-name">图书名称</div>
        <div class="list-header-item col-author">作者</div>
        <div class="list-header-item col-time">借阅时间</div>
        <div class="list-header-item col-return">归还状态</div>
        <div class="list-header-item col-overdue">逾期状态</div>
        <div class="list-header-item col-action">操作</div>
      </div>
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
import { useRouter } from 'vue-router';
import { useBookStore } from '@/store/bookStore';
import { useUserStore } from '@/store/userStore';
import BorrowItem from '@/components/BorrowItem.vue';
import axios from 'axios';

const router = useRouter();
const bookStore = useBookStore();
const userStore = useUserStore();

const allRecords = ref([]);
const statusFilter = ref('all');
const filteredRecords = ref([]);

const fetchBorrowRecords = async () => {
  if (!userStore.currentUser) {
    allRecords.value = [];
    filteredRecords.value = [];
    return;
  }

  const userId = userStore.currentUser.id;
  const token = localStorage.getItem('token');

  try {
    if (bookStore.books.length === 0) {
      await bookStore.loadBooks();
    }

    const response = await axios.get(`/api/borrows/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const rawRecords = response.data || [];

    // 调试：查看后端实际返回的字段名
    if (rawRecords.length > 0) {
      console.log('后端返回的原始记录示例：', rawRecords[0]);
    }

    const now = new Date();
    const enhanced = rawRecords.map(record => {
      const book = bookStore.books.find(b => Number(b.id) === Number(record.bookId)) || {};
      const borrowDate = record.borrowTime ? new Date(record.borrowTime) : new Date();
      const diffDays = Math.floor((now - borrowDate) / (1000 * 60 * 60 * 24));

      // 兼容两种字段名：后端序列化后通常为 `returned`，但也可能为 `isReturned`
      const returned = record.returned === true || record.returned === 'true'
                    || record.isReturned === true || record.isReturned === 'true';

      const overdue = !returned && diffDays > 7;
      const overdueDays = overdue ? diffDays - 7 : 0;

      return {
        id: record.id,
        bookId: record.bookId,
        bookName: book.name || '未知书籍',
        author: book.author || '未知作者',
        borrowTime: record.borrowTime,
        returnTime: record.returnTime,
        isReturned: returned,          // 统一使用 isReturned 给模板
        overdue: overdue,
        overdueDays: overdueDays,
        recordId: record.id,
        remainingDays: returned ? 0 : Math.max(0, 7 - diffDays),
        renewCount: record.renewCount ?? 0
      };
    });

    allRecords.value = enhanced;
    filterRecords();
  } catch (error) {
    console.error('加载借阅记录失败:', error);
    allRecords.value = [];
    filteredRecords.value = [];
    if (error.response?.status === 401) {
      alert('登录已过期，请重新登录');
      userStore.logout();
      router.push('/login');
    } else {
      alert('加载借阅记录失败，请稍后重试');
    }
  }
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

const handleReturn = async (arg) => {
  const borrowId = typeof arg === 'object' ? (arg.recordId || arg.id) : arg;

  if (!userStore.currentUser) {
    alert('请先登录');
    return;
  }

  const token = localStorage.getItem('token');
  try {
    const response = await axios.put(`/api/borrows/return/${borrowId}`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert(response.data.message || '归还成功');

    // 立即更新本地数据
    const idx = allRecords.value.findIndex(r => r.id === borrowId);
    if (idx !== -1) {
      const updated = { ...allRecords.value[idx] };
      updated.isReturned = true;
      updated.returnTime = new Date().toISOString().slice(0, 10);
      updated.remainingDays = 0;
      updated.overdue = false;
      updated.overdueDays = 0;
      allRecords.value.splice(idx, 1, updated);
      allRecords.value = [...allRecords.value];
    }

    if (statusFilter.value === 'unreturned') {
      statusFilter.value = 'all';
    }
    filterRecords();

    // 异步刷新保证最终一致
    await fetchBorrowRecords();
  } catch (error) {
    alert('归还失败：' + (error.response?.data?.message || error.message));
  }
};

onMounted(() => {
  fetchBorrowRecords();
});
</script>

<style scoped>
.borrow-history-page { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin: 20px; }
.page-title { margin-bottom: 20px; color: #333; border-bottom: 1px solid #e4e7ed; padding-bottom: 10px; font-size: 18px; }
.filter-bar { margin-bottom: 20px; }
.filter-bar select { padding: 8px 12px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; cursor: pointer; }
.history-container { width: 100%; border: 1px solid #e4e7ed; border-radius: 4px; overflow: hidden; }
.list-header { display: flex; width: 100%; font-weight: bold; padding: 12px 0; background: #f9fafb; font-size: 14px; border-bottom: 1px solid #e4e7ed; box-sizing: border-box; }
.list-header-item { box-sizing: border-box; padding: 0 10px; height: 100%; display: flex; align-items: center; }
.col-name { width: 25%; justify-content: flex-start; }
.col-author { width: 15%; justify-content: flex-start; }
.col-time { width: 20%; justify-content: flex-start; }
.col-return { width: 15%; justify-content: center; }
.col-overdue { width: 15%; justify-content: center; }
.col-action { width: 10%; justify-content: center; }
.list-content { width: 100%; background: #fff; }
.empty-tip { text-align: center; padding: 50px 0; color: #999; font-size: 16px; }
@media (max-width: 768px) {
  .list-header-item { font-size: 12px; padding: 0 5px; }
  .col-name { width: 22%; } .col-author { width: 13%; } .col-time { width: 20%; } .col-return { width: 15%; } .col-overdue { width: 15%; } .col-action { width: 15%; }
}
</style>