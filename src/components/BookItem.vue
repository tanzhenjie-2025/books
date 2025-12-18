<template>
  <div class="book-item">
    <!-- 书籍基础信息 -->
    <div class="book-basic-info">
      <div class="book-main-info">
        <p class="book-name"><strong>书名：</strong>{{ book.name }}</p>
        <p class="book-author"><strong>作者：</strong>{{ book.author }}</p>
        <p class="book-publish"><strong>出版社：</strong>{{ book.publish }}</p>
        <p class="book-stock"><strong>库存：</strong>{{ book.stock }} 本</p>
        <p class="book-borrow-count"><strong>借阅次数：</strong>{{ book.borrowCount || 0 }} 次</p>
        <p class="book-category"><strong>分类：</strong>{{ book.category }}</p>
        <p class="book-desc"><strong>简介：</strong>{{ book.description }}</p>
      </div>

      <!-- 操作按钮区 -->
      <div class="book-actions" v-if="showBorrowBtn">
        <button
          class="borrow-btn"
          @click="handleBorrow"
          :disabled="book.stock <= 0"
        >
          {{ book.stock <= 0 ? '库存不足' : '借阅' }}
        </button>
        <!-- 新增评论按钮 -->
        <button class="comment-btn" @click="handleComment">
          评论
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

// 接收props
const props = defineProps({
  book: {
    type: Object,
    required: true,
    default: () => ({})
  },
  showBorrowBtn: {
    type: Boolean,
    default: true
  }
});

// 定义事件
const emit = defineEmits(['borrow']);

// 路由实例
const router = useRouter();

// 处理借书
const handleBorrow = () => {
  emit('borrow', props.book.id);
};

// 处理评论按钮：跳转到单独评论页
const handleComment = () => {
  router.push(`/book-comment/${props.book.id}`);
};
</script>

<style scoped>
/* 核心修改：添加高度100% + box-sizing，适配多列布局 */
.book-item {
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  box-sizing: border-box; /* 确保padding不影响宽度 */
  height: 100%; /* 确保同列卡片高度一致 */
}

.book-basic-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.book-main-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.book-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.book-author, .book-publish, .book-stock, .book-borrow-count, .book-category, .book-desc {
  font-size: 14px;
  color: #4b5563;
  margin: 0;
  line-height: 1.5;
}

.book-desc {
  max-width: 800px;
  word-break: break-all;
}

/* 操作按钮区 */
.book-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 120px;
}

.borrow-btn {
  padding: 10px 0;
  border: none;
  border-radius: 6px;
  background-color: #409eff;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.borrow-btn:hover {
  background-color: #66b1ff;
}

.borrow-btn:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

/* 评论按钮 */
.comment-btn {
  padding: 10px 0;
  border: none;
  border-radius: 6px;
  background-color: #909399;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.comment-btn:hover {
  background-color: #a8abb2;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .book-basic-info {
    flex-direction: column;
    gap: 15px;
  }

  .book-actions {
    width: 100%;
    flex-direction: row;
  }

  .borrow-btn, .comment-btn {
    flex: 1;
  }
}
</style>