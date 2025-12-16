<template>
  <div class="borrow-item list-item">
    <div class="borrow-info">
      <p class="book-name"><strong>书名：</strong>{{ borrow.bookName }}</p>
      <p class="book-author"><strong>作者：</strong>{{ borrow.bookAuthor }}</p>
      <p class="borrow-time"><strong>借阅时间：</strong>{{ borrow.borrowTime }}</p>
      <p class="overdue" v-if="borrow.overdue">
        <strong style="color: #f56c6c">状态：</strong>已超时{{ borrow.overdueDays }}天
      </p>
      <p class="not-overdue" v-else>
        <!-- 核心修复：去掉()，computed是属性不是函数 -->
        <strong style="color: #67c23a">状态：</strong>未超时（剩余{{ 7 - calcRemainingDays }}天）
      </p>
    </div>
    <button class="btn btn-success return-btn" @click="handleReturn">
      归还
    </button>
  </div>
</template>

<script setup>
/**
 * 借阅项组件：展示单条借阅记录，提供归还按钮
 * 课程设计注释：复用借阅展示逻辑，显示剩余借阅天数/超时时长
 */
import { defineProps, defineEmits, computed } from 'vue';
import { isOverdue, calcOverdueDays } from '@/utils/dateUtils';

// 接收props：借阅记录
const props = defineProps({
  borrow: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

// 定义事件：归还
const emit = defineEmits(['return']);

/**
 * 计算剩余借阅天数（未超时）- computed是属性，不是函数
 */
const calcRemainingDays = computed(() => {
  const borrowDate = new Date(props.borrow.borrowTime);
  const nowDate = new Date();
  const diffTime = nowDate - borrowDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return 7 - diffDays; // 直接返回数值，模板里直接用，不用加()
});

/**
 * 触发归还事件
 */
const handleReturn = () => {
  emit('return', props.borrow.id);
};
</script>

<style scoped> /* 加回scoped，避免样式污染 */
.borrow-item {
  background: #fff;
  border-radius: 4px;
  margin-bottom: 10px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e4e7ed;
}

.borrow-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.book-name,
.book-author,
.borrow-time,
.overdue,
.not-overdue {
  margin: 0;
  color: #333;
  font-size: 14px;
}

.overdue {
  color: #f56c6c;
}

.not-overdue {
  color: #67c23a;
}

.return-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #67c23a;
  color: #fff;
  cursor: pointer;
}

.return-btn:hover {
  background: #85ce61;
}
</style>