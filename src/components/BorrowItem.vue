<template>
  <div class="borrow-item list-item">
    <div class="borrow-info">
      <p class="book-name"><strong>书名：</strong>{{ borrow.bookName }}</p>
      <p class="book-author"><strong>作者：</strong>{{ borrow.bookAuthor }}</p>
      <p class="borrow-time"><strong>借阅时间：</strong>{{ borrow.borrowTime }}</p>

      <!-- 已归还状态 -->
      <p class="returned" v-if="borrow.isReturned">
        <strong style="color: #909399">状态：</strong>已归还
      </p>

      <!-- 未归还 - 已逾期 -->
      <p class="overdue" v-else-if="borrow.overdue">
        <strong style="color: #f56c6c">状态：</strong>已超时{{ borrow.overdueDays }}天
      </p>

      <!-- 未归还 - 未逾期 -->
      <p class="not-overdue" v-else>
        <strong style="color: #67c23a">状态：</strong>未超时（剩余{{ borrow.remainingDays }}天）
      </p>
    </div>
    <div class="action-buttons">
      <!-- 仅未归还且满足条件时显示续借按钮 -->
      <button
        class="btn btn-warning renew-btn"
        @click="handleRenew"
        :disabled="borrow.isReturned || !canRenew"
      >
        续借
      </button>
      <!-- 仅未归还时显示归还按钮 -->
      <button
        class="btn btn-success return-btn"
        @click="handleReturn"
        :disabled="borrow.isReturned"
      >
        归还
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  borrow: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

const emit = defineEmits(['return', 'renew']);

// 是否可续借（未归还+未逾期+剩余<3天）
const canRenew = computed(() => {
  if (props.borrow.isReturned || props.borrow.overdue) return false;
  return Number(props.borrow.remainingDays) < 3;
});

const handleReturn = () => {
  emit('return', props.borrow.id);
};

const handleRenew = () => {
  emit('renew', props.borrow.id);
};
</script>

<style scoped>
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
.not-overdue,
.returned {
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

.returned {
  color: #909399;
}

.action-buttons {
  display: flex;
  gap: 10px;
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

.return-btn:disabled {
  background: #e1e6eb;
  cursor: not-allowed;
}

.renew-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #e6a23c;
  color: #fff;
  cursor: pointer;
}

.renew-btn:disabled {
  background: #f3d19e;
  cursor: not-allowed;
}

.renew-btn:hover:not(:disabled) {
  background: #f56c6c;
}
</style>