<template>
  <div class="pagination" v-if="totalPages > 1">
    <button
      class="btn"
      @click="changePage(1)"
      :disabled="currentPage === 1"
    >
      首页
    </button>
    <button
      class="btn"
      @click="changePage(currentPage - 1)"
      :disabled="currentPage === 1"
    >
      上一页
    </button>
    <span class="page-info">
      第 {{ currentPage }} / {{ totalPages }} 页
    </span>
    <button
      class="btn"
      @click="changePage(currentPage + 1)"
      :disabled="currentPage === totalPages"
    >
      下一页
    </button>
    <button
      class="btn"
      @click="changePage(totalPages)"
      :disabled="currentPage === totalPages"
    >
      末页
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

// 1. 声明接收的 props
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    default: 10
  }
});

// 2. 声明自定义事件（正确的 emit 定义方式）
const emit = defineEmits(['page-change']);

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.pageSize);
});

// 页码切换方法
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('page-change', page); // 触发自定义事件
  }
};
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  justify-content: center;
}

.page-info {
  color: #666;
}

.btn {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  cursor: not-allowed;
  color: #999;
  background: #f5f7fa;
  border-color: #e4e7ed;
}

.btn:not(:disabled):hover {
  background: #f5f7fa;
  border-color: #c0c4cc;
}
</style>