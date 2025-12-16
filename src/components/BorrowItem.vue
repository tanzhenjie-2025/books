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
        <strong style="color: #67c23a">状态：</strong>未超时（剩余{{ calcRemainingDays }}天）
      </p>
    </div>
    <div class="action-buttons">
      <button
        class="btn btn-warning renew-btn"
        @click="handleRenew"
        :disabled="!canRenew"
      >
        续借
      </button>
      <button class="btn btn-success return-btn" @click="handleReturn">
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

// 计算剩余天数
const calcRemainingDays = computed(() => {
  const borrowDate = new Date(props.borrow.borrowTime);
  const nowDate = new Date();
  const diffTime = nowDate - borrowDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return 7 - diffDays;
});

// 是否可续借（剩余<3天+未超时）
const canRenew = computed(() => {
  if (props.borrow.overdue) return false;
  return calcRemainingDays.value < 3;
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