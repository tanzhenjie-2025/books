<template>
  <div class="violation-item list-item">
    <div class="violation-info">
      <p class="book-name"><strong>书名：</strong>{{ violation.bookName }}</p>
      <p class="borrow-time"><strong>借阅时间：</strong>{{ violation.borrowTime }}</p>
      <p class="overdue-days">
        <strong style="color: #f56c6c">超时时长：</strong>{{ violation.overdueDays }} 天
      </p>
    </div>
    <div class="violation-tip">
      <span style="color: #f56c6c">未归还</span>
    </div>
  </div>
</template>

<script setup>
/**
 * 违规项组件：展示单条违规记录，显示超时时长
 * 课程设计注释：复用违规展示逻辑，突出超时时长和未归还状态
 */
import { defineProps } from 'vue';

// 接收props：违规记录
const props = defineProps({
  violation: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});
</script>

<style scoped>
.violation-item {
  background: #fdf2f8;
  border-radius: 4px;
  margin-bottom: 10px;
}

.violation-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.book-name,
.borrow-time,
.overdue-days {
  margin: 0;
  color: #333;
}
</style>