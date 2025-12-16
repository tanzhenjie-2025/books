<template>
  <div class="book-item list-item">
    <div class="book-info">
      <p class="book-name"><strong>书名：</strong>{{ book.name }}</p>
      <p class="book-author"><strong>作者：</strong>{{ book.author }}</p>
      <p class="book-category"><strong>分类：</strong>{{ book.category }}</p>
      <p class="book-stock"><strong>库存：</strong>{{ book.stock }} 本</p>
      <p class="book-description"><strong>简介：</strong>{{ book.description }}</p>
    </div>
    <div class="book-actions">
      <button
        class="btn btn-primary borrow-btn"
        @click="handleBorrow"
        :disabled="book.stock <= 0"
      >
        {{ book.stock <= 0 ? '库存不足' : '借阅' }}
      </button>
      <button
        class="btn btn-secondary comment-btn"
        @click="handleComment"
      >
        评论
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

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

const handleComment = () => {
  router.push(`/book-comments/${props.book.id}`);
};
</script>

<style scoped>
.book-item {
  background: #f9fafb;
  border-radius: 4px;
  margin-bottom: 10px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.book-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  flex: 1;
}

.book-name,
.book-author,
.book-category,
.book-stock,
.book-description {
  margin: 0;
  color: #333;
  min-width: 150px;
}

.book-actions {
  display: flex;
  gap: 10px;
}

.borrow-btn {
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.borrow-btn:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

.comment-btn {
  padding: 8px 16px;
  background: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.comment-btn:hover {
  background: #52c41a;
}
</style>