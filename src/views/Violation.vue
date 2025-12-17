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
          <p><strong>借阅时间：</strong>{{ formatDate(record.borrowTime) }}</p>
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
 * 修复点：
 * 1. 异步加载书籍和借阅记录，确保数据完整
 * 2. 补充日期格式化，优化时间显示
 * 3. 安全访问属性，避免空指针
 * 4. 结合登录状态，未登录时自动拦截
 * 5. 数据加载失败时友好提示
 */
import { ref, onMounted } from 'vue';
import { useBookStore } from '@/store/bookStore';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'vue-router';

// 初始化核心依赖
const bookStore = useBookStore();
const userStore = useUserStore();
const router = useRouter();

// 初始化违规记录（避免undefined）
const violationRecords = ref([]);

/**
 * 日期格式化工具函数：将时间戳/字符串转为友好格式 YYYY-MM-DD
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '未知时间';
  try {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  } catch (e) {
    return '未知时间';
  }
};

/**
 * 获取当前用户的违规记录（超时未归还）
 * 修复：先加载完整数据，再筛选违规记录
 */
const getViolationRecords = async () => {
  // 未登录时跳登录页（双重保障，配合路由守卫）
  if (!userStore.currentUser) {
    violationRecords.value = [];
    router.push('/login');
    return;
  }

  try {
    // 1. 先加载书籍列表（确保能关联书籍名称）
    await bookStore.loadBooks();
    // 2. 加载当前用户的所有借阅记录
    const loadResult = await bookStore.loadBorrowRecords(userStore.currentUser.id);

    if (!loadResult.success) {
      alert(`加载借阅记录失败：${loadResult.message}`);
      violationRecords.value = [];
      return;
    }

    // 3. 从借阅记录中筛选：未归还 + 超时的记录
    const allBorrows = bookStore.borrowRecords || [];
    const userViolations = allBorrows
      .filter(record =>
        record.userId === userStore.currentUser.id
        && !record.returned // 兼容后端returned字段（替代isReturned）
        && record.overdue // 已逾期
        && record.overdueDays > 0 // 逾期天数>0
      )
      .map(record => {
        // 关联书籍信息（安全访问，避免book为undefined）
        const book = bookStore.books?.find(book => book.id === record.bookId) || {};
        return {
          ...record,
          bookName: book.name,
          bookAuthor: book.author,
          isHandled: false, // 初始默认未处理（可根据后端字段调整）
          // 兼容前端isReturned字段
          isReturned: record.returned
        };
      });

    violationRecords.value = userViolations;
  } catch (error) {
    console.error('获取违规记录失败:', error);
    violationRecords.value = [];
    alert('获取违规记录失败，请稍后重试');
  }
};

// 页面挂载时获取违规记录（确保数据加载完成）
onMounted(async () => {
  // 等待Pinia状态恢复（从localStorage）
  await Promise.resolve();
  // 加载违规记录
  await getViolationRecords();
});
</script>

<style scoped>
.violation-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin: 20px auto; /* 居中显示 */
  max-width: 1200px; /* 适配全局宽度 */
}

.page-title {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
  font-size: 18px;
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
  transition: box-shadow 0.2s;
}

.violation-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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