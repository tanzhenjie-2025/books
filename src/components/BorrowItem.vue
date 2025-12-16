<template>
  <div class="borrow-item list-item card">
    <div class="borrow-info">
      <h3 class="book-name">{{ borrow.bookName }}</h3>
      <p class="book-author"><strong>作者：</strong>{{ borrow.bookAuthor }}</p>
      <p class="borrow-time"><strong>借阅时间：</strong>{{ formatDate(borrow.borrowTime) }}</p>
      <div class="status">
        <p class="overdue" v-if="borrow.overdue">
          <span class="icon">⚠️</span>
          <strong>已超时{{ borrow.overdueDays }}天</strong>
          <span class="fine">需缴纳罚款：{{ borrow.overdueDays * 0.5 }}元</span>
        </p>
        <p class="not-overdue" v-else>
          <span class="icon">✅</span>
          <strong>未超时（剩余{{ 7 - calcRemainingDays }}天）</strong>
        </p>
      </div>
    </div>
    <button class="btn btn-success return-btn" @click="handleReturn">
      <span class="icon">🔙</span>归还
    </button>
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

const emit = defineEmits(['return']);

// 计算剩余天数
const calcRemainingDays = computed(() => {
  const borrowDate = new Date(props.borrow.borrowTime);
  const nowDate = new Date();
  const diffTime = nowDate - borrowDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

const handleReturn = () => {
  emit('return', props.borrow.id);
};
</script>

<style scoped>
.borrow-item {
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-bottom: 0;
  padding: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  border: none;
}

.borrow-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.book-name {
  margin: 0;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 600;
}

.book-author, .borrow-time {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.status {
  margin-top: 5px;
}

.overdue {
  margin: 0;
  color: var(--danger);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  .fine {
    margin-left: 10px;
    font-size: 13px;
  }
}

.not-overdue {
  margin: 0;
  color: var(--success);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.return-btn {
  min-width: 100px;
  padding: 10px 16px;
}

.icon {
  font-size: 16px;
}

@media (max-width: 768px) {
  .borrow-item {
    flex-direction: column;
    align-items: stretch;
  }
  .return-btn {
    width: 100%;
  }
}
</style>