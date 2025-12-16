<template>
  <div class="violation-page">
    <h2 class="page-title">我的违规记录</h2>
    <!-- 空值判断：确保violationRecords存在且长度为0时显示提示 -->
    <div class="empty-tip" v-if="violationRecords && violationRecords.length === 0">
      暂无违规记录，请注意按时归还书籍哦！
    </div>
    <!-- 违规记录列表：仅当有数据时渲染 -->
    <div class="violation-list list" v-else-if="violationRecords">
      <div
        class="violation-item"
        v-for="record in violationRecords"
        :key="record.id"
      >
        <div class="violation-info">
          <p><strong>违规书籍：</strong>{{ record.bookName || '未知书籍' }}</p>
          <p><strong>借阅时间：</strong>{{ record.borrowTime }}</p>
          <p><strong>超时天数：</strong><span class="overdue-days">{{ record.overdueDays }}天</span></p>
          <p><strong>违规状态：</strong>{{ record.isHandled ? '已处理' : '未处理' }}</p>
        </div>
      </div>
    </div>
    <!-- 加载中提示（可选） -->
    <div class="loading-tip" v-else>
      加载中...
    </div>
  </div>
</template>

<script setup>
/**
 * 违规记录页面：展示超时未归还的违规记录
 * 修复点：1. 空值判断 2. 变量初始化 3. 安全访问属性
 */
import { computed, ref, onMounted } from 'vue';
import { useBookStore } from '@/store/bookStore';
import { useUserStore } from '@/store/userStore';

// 初始化store
const bookStore = useBookStore();
const userStore = useUserStore();

// 初始化违规记录（避免undefined）
const violationRecords = ref([]);

/**
 * 获取当前用户的违规记录（超时未归还）
 */
const getViolationRecords = () => {
  if (!userStore.currentUser) { // 未登录时直接返回空
    violationRecords.value = [];
    return;
  }

  // 从借阅记录中筛选：未归还 + 超时的记录
  const allBorrows = bookStore.borrowRecords || [];
  const userViolations = allBorrows
    .filter(record =>
      record.userId === userStore.currentUser.id
      && !record.isReturned
      && record.overdue
      && record.overdueDays > 0
    )
    .map(record => {
      // 关联书籍信息（安全访问，避免book为undefined）
      const book = bookStore.books?.find(book => book.id === record.bookId) || {};
      return {
        ...record,
        bookName: book.name,
        bookAuthor: book.author,
        isHandled: false // 初始默认未处理
      };
    });

  violationRecords.value = userViolations;
};

// 页面挂载时获取违规记录
onMounted(() => {
  getViolationRecords();
});
</script>

<style scoped>
.violation-page {
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

.violation-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.violation-item {
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.violation-info p {
  margin: 5px 0;
  color: #333;
  font-size: 14px;
}

.overdue-days {
  color: #f56c6c;
  font-weight: bold;
}
</style>