<template>
  <div class="book-item list-item">
    <div class="book-info">
      <p class="book-name"><strong>书名：</strong>{{ book.name }}</p>
      <p class="book-author"><strong>作者：</strong>{{ book.author }}</p>
      <p class="book-publish"><strong>出版社：</strong>{{ book.publish }}</p>
      <p class="book-stock"><strong>库存：</strong>{{ book.stock }} 本</p>
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
/**
 * 图书项组件：展示单本图书信息，提供借阅按钮
 * 课程设计注释：复用图书展示逻辑，禁用库存不足的借阅按钮
 */
import { defineProps, defineEmits } from 'vue'; // 核心修复：替换emit为defineEmits

// 接收props：图书信息
const props = defineProps({
  book: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

// 定义事件：借阅（核心修复：用defineEmits声明事件，无重复声明）
const emit = defineEmits(['borrow']);

/**
 * 触发借阅事件
 */
const handleBorrow = () => {
  emit('borrow', props.book.id);
};
</script>

<style scoped>
.book-item {
  background: #f9fafb;
  border-radius: 4px;
  margin-bottom: 10px;
}

.book-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.book-name,
.book-author,
.book-publish,
.book-stock {
  margin: 0;
  color: #333;
}

.borrow-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>