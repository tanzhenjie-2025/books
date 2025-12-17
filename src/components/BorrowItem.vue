<template>
  <!-- 100%宽度，flex布局，6列匹配表头 -->
  <div class="borrow-item list-item">
    <!-- 第1列：图书名称（匹配表头25%） -->
    <div class="col col-name">
      <p class="book-name">{{ borrow.bookName }}</p>
    </div>
    <!-- 第2列：作者（新增，匹配表头15%） -->
    <div class="col col-author">
      <p class="book-author">{{ borrow.bookAuthor }}</p>
    </div>
    <!-- 第3列：借阅时间（匹配表头20%） -->
    <div class="col col-time">
      <p class="borrow-time">{{ borrow.borrowTime }}</p>
    </div>
    <!-- 第4列：归还状态（匹配表头15%） -->
    <div class="col col-return">
      <p class="returned" v-if="borrow.isReturned">
        <strong style="color: #909399">已归还</strong>
      </p>
      <p class="not-returned" v-else>
        <strong style="color: #e6a23c">未归还</strong>
      </p>
    </div>
    <!-- 第5列：逾期状态（匹配表头15%） -->
    <div class="col col-overdue">
      <p class="overdue" v-if="borrow.overdue">
        <strong style="color: #f56c6c">超时{{ borrow.overdueDays }}天</strong>
      </p>
      <p class="not-overdue" v-else-if="!borrow.isReturned">
        <strong style="color: #67c23a">剩余{{ borrow.remainingDays }}天</strong>
      </p>
      <p class="no-overdue" v-else>
        <strong style="color: #909399">-</strong>
      </p>
    </div>
    <!-- 第6列：操作按钮（匹配表头10%） -->
    <div class="col col-action">
      <div class="action-buttons">
        <button
          class="renew-btn"
          @click="handleRenew"
          :disabled="borrow.isReturned || !canRenew"
        >
          续借
        </button>
        <button
          class="return-btn"
          @click="handleReturn"
          :disabled="borrow.isReturned"
        >
          归还
        </button>
      </div>
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

// 是否可续借
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
/* 核心：100%宽度，flex布局，6列匹配表头 */
.borrow-item {
  display: flex;
  width: 100%;
  padding: 12px 0;
  border-bottom: 1px solid #e4e7ed;
  box-sizing: border-box; /* 内边距计入宽度 */
  align-items: center; /* 垂直居中（和表头一致） */
  font-size: 14px;
}

/* 通用列样式：无额外边距，匹配表头 */
.col {
  box-sizing: border-box;
  padding: 0 10px; /* 和表头内边距完全一致 */
  height: 100%;
  display: flex;
  align-items: center; /* 垂直居中（和表头一致） */
}

/* 每列占比完全匹配表头（6列） */
.col-name {
  width: 25%;
  justify-content: flex-start; /* 左对齐（和表头一致） */
}
.col-author {
  width: 15%; /* 作者列（新增） */
  justify-content: flex-start; /* 左对齐（和表头一致） */
}
.col-time {
  width: 20%;
  justify-content: flex-start; /* 左对齐（和表头一致） */
}
.col-return {
  width: 15%;
  justify-content: center; /* 居中（和表头一致） */
}
.col-overdue {
  width: 15%;
  justify-content: center; /* 居中（和表头一致） */
}
.col-action {
  width: 10%; /* 操作列（缩窄） */
  justify-content: center; /* 居中（和表头一致） */
}

/* 图书名称/作者列样式 */
.book-name, .book-author {
  margin: 0; /* 移除默认margin */
  color: #333;
  line-height: 1.4;
}
.book-name {
  font-weight: 500;
}
.book-author {
  font-size: 14px;
  color: #666;
}

/* 状态文本样式（无额外margin） */
.returned, .not-returned, .overdue, .not-overdue, .no-overdue, .borrow-time {
  margin: 0; /* 关键：移除默认margin，避免对齐偏差 */
  line-height: 1.4;
}

/* 操作按钮样式（适配窄列） */
.action-buttons {
  display: flex;
  gap: 4px; /* 缩小间距适配窄列 */
  justify-content: center; /* 按钮容器居中 */
  flex-wrap: wrap; /* 移动端自动换行 */
}
.return-btn, .renew-btn {
  padding: 4px 6px; /* 缩小按钮内边距 */
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap; /* 按钮文字不换行 */
}
.return-btn {
  background: #67c23a;
}
.return-btn:hover {
  background: #85ce61;
}
.return-btn:disabled {
  background: #e1e6eb;
  cursor: not-allowed;
}
.renew-btn {
  background: #e6a23c;
}
.renew-btn:hover:not(:disabled) {
  background: #f56c6c;
}
.renew-btn:disabled {
  background: #f3d19e;
  cursor: not-allowed;
}

/* 响应式适配（和表头一致） */
@media (max-width: 768px) {
  .borrow-item {
    font-size: 12px;
  }
  .col {
    padding: 0 5px;
  }
  .col-name { width: 22%; }
  .col-author { width: 13%; }
  .col-time { width: 20%; }
  .col-return { width: 15%; }
  .col-overdue { width: 15%; }
  .col-action { width: 15%; }
  .return-btn, .renew-btn {
    padding: 2px 4px;
    font-size: 11px;
  }
}
</style>