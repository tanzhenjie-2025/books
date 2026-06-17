<template>
  <div class="borrow-item list-item">
    <!-- 第1列：图书名称 -->
    <div class="col col-name">
      <p class="book-name">{{ borrow.bookName }}</p>
    </div>
    <!-- 第2列：作者 -->
    <div class="col col-author">
      <p class="book-author">{{ borrow.author }}</p>
    </div>
    <!-- 第3列：借阅时间 -->
    <div class="col col-time">
      <p class="borrow-time">{{ borrow.borrowTime }}</p>
    </div>
    <!-- 第4列：归还状态 -->
    <div class="col col-return">
      <p v-if="borrow.isReturned"><strong style="color: #909399">已归还</strong></p>
      <p v-else><strong style="color: #e6a23c">未归还</strong></p>
    </div>
    <!-- 第5列：逾期状态 -->
    <div class="col col-overdue">
      <p v-if="borrow.overdue"><strong style="color: #f56c6c">超时{{ borrow.overdueDays }}天</strong></p>
      <p v-else-if="!borrow.isReturned"><strong style="color: #67c23a">剩余{{ borrow.remainingDays }}天</strong></p>
      <p v-else><strong style="color: #909399">-</strong></p>
    </div>
    <!-- 第6列：操作按钮（完全重新设计，确保可点击） -->
    <div class="col col-action">
      <button
        class="return-btn"
        @click="handleReturnClick"
        :disabled="false"
        v-if="!borrow.isReturned"
      >
        归还
      </button>
      <span v-else style="color:#909399">-</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  borrow: { type: Object, required: true }
});

const emit = defineEmits(['return']);

const handleReturnClick = () => {
  // 调试输出（上线后可删除）
  console.log('[BorrowItem] 归还按钮被点击！borrow对象:', props.borrow);
  // 发送事件，传递 borrow.id
  emit('return', props.borrow.id);
};
</script>

<style scoped>
/* 原有样式保持不变，只调整按钮样式确保可见和可点 */
.borrow-item {
  display: flex;
  width: 100%;
  padding: 12px 0;
  border-bottom: 1px solid #e4e7ed;
  box-sizing: border-box;
  align-items: center;
  font-size: 14px;
}
.col {
  box-sizing: border-box;
  padding: 0 10px;
  height: 100%;
  display: flex;
  align-items: center;
}
.col-name { width: 25%; }
.col-author { width: 15%; }
.col-time { width: 20%; }
.col-return { width: 15%; justify-content: center; }
.col-overdue { width: 15%; justify-content: center; }
.col-action { width: 10%; justify-content: center; }
.return-btn {
  padding: 6px 14px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
  z-index: 10;           /* 确保在前景 */
  pointer-events: auto;  /* 保证可点击 */
}
.return-btn:hover {
  background-color: #85ce61;
}
.book-name, .book-author {
  margin: 0;
  color: #333;
  line-height: 1.4;
}
.book-author { font-size: 14px; color: #666; }
p { margin: 0; line-height: 1.4; }
</style>