<template>
  <div class="book-item list-item card">
    <div class="book-info">
      <div class="book-header">
        <h3 class="book-name">{{ book.name }}</h3>
        <span class="book-category">{{ book.category }}</span>
      </div>
      <p class="book-author"><strong>作者：</strong>{{ book.author }}</p>
      <p class="book-publish" v-if="book.publish"><strong>出版社：</strong>{{ book.publish }}</p>
      <p class="book-description" v-if="book.description">
        <strong>简介：</strong>{{ book.description.length > 80 ? book.description.slice(0, 80) + '...' : book.description }}
      </p>
      <div class="book-stats">
        <span class="stock" :class="{ low: book.stock <= 2 }">
          库存：{{ book.stock }} 本
        </span>
        <span class="borrow-count">
          借阅次数：{{ book.borrowCount || 0 }}
        </span>
      </div>
    </div>
    <button
      class="btn btn-primary borrow-btn"
      @click="handleBorrow"
      :disabled="book.stock <= 0"
    >
      {{ book.stock <= 0 ? '库存不足' : '借阅' }}
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  book: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

const emit = defineEmits(['borrow']);

const handleBorrow = () => {
  emit('borrow', props.book.id);
};
</script>

<style scoped>
.book-item {
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

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.book-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.book-name {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
}

.book-category {
  background: rgba(64, 158, 255, 0.1);
  color: var(--primary);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.book-author, .book-publish {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.book-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  padding-top: 5px;
}

.book-stats {
  display: flex;
  gap: 15px;
  margin-top: 8px;
  font-size: 14px;
}

.stock {
  color: var(--success);
  &.low {
    color: var(--warning);
  }
}

.borrow-count {
  color: var(--text-placeholder);
}

.borrow-btn {
  min-width: 100px;
  padding: 10px 16px;
}

@media (max-width: 768px) {
  .book-item {
    flex-direction: column;
    align-items: stretch;
  }
  .borrow-btn {
    width: 100%;
  }
  .book-description {
    display: none;
  }
}
</style>