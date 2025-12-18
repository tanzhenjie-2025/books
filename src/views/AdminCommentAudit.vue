<template>
  <div class="admin-comment-audit">
    <h2>评论审核管理</h2>

    <!-- 筛选条件 -->
    <div class="filter-bar">
      <input
        v-model="filterBookId"
        type="number"
        placeholder="输入书籍ID筛选"
        class="filter-input"
      >
      <button @click="loadPendingComments" class="filter-btn">筛选</button>
      <button @click="filterBookId = ''; loadPendingComments()" class="reset-btn">重置</button>
    </div>

    <!-- 待审核评论列表 -->
    <div class="comment-list" v-if="pendingComments.length > 0">
      <div class="comment-item" v-for="comment in pendingComments" :key="comment.id">
        <div class="comment-header">
          <span class="comment-info">
            评论ID：{{ comment.id }} | 书籍ID：{{ comment.bookId }} | 用户ID：{{ comment.userId }}
          </span>
          <span class="comment-score">评分：{{ comment.score }}星</span>
        </div>
        <div class="comment-content">{{ comment.content || '无内容' }}</div>
        <div class="comment-actions">
          <button @click="auditComment(comment.id, true)" class="pass-btn">审核通过</button>
          <button @click="auditComment(comment.id, false)" class="reject-btn">审核驳回</button>
          <button @click="deleteComment(comment.id)" class="delete-btn">删除评论</button>
        </div>
      </div>
    </div>

    <!-- 空数据提示 -->
    <div class="empty-tip" v-else>
      暂无待审核评论
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '@/utils/request';

// 替换ElementPlus的ElMessage为原生alert
const showMessage = (message, type = 'info') => {
  if (type === 'error') {
    alert(`错误：${message}`);
  } else if (type === 'success') {
    alert(`成功：${message}`);
  } else {
    alert(message);
  }
};

// 响应式数据
const filterBookId = ref('');
const pendingComments = ref([]);

// 加载待审核评论
const loadPendingComments = async () => {
  try {
    const params = filterBookId.value ? { bookId: filterBookId.value } : {};
    const res = await request.get('/comments/pending', { params });
    if (res.success) {
      pendingComments.value = res.data;
    } else {
      showMessage(res.message || '加载待审核评论失败', 'error');
    }
  } catch (error) {
    showMessage(`加载失败：${error.message}`, 'error');
  }
};

// 审核评论
const auditComment = async (commentId, pass) => {
  try {
    const res = await request.put(`/comments/audit/${commentId}`, null, {
      params: { pass }
    });
    if (res.success) {
      showMessage(res.message, 'success');
      // 刷新列表
      loadPendingComments();
    } else {
      showMessage(res.message, 'error');
    }
  } catch (error) {
    showMessage(`审核失败：${error.message}`, 'error');
  }
};

// 删除评论
const deleteComment = async (commentId) => {
  if (!confirm('确定删除该评论吗？删除后不可恢复！')) return;

  try {
    const res = await request.delete(`/comments/${commentId}`);
    if (res.success) {
      showMessage(res.message, 'success');
      // 刷新列表
      loadPendingComments();
    } else {
      showMessage(res.message, 'error');
    }
  } catch (error) {
    showMessage(`删除失败：${error.message}`, 'error');
  }
};

// 页面挂载时加载数据
onMounted(() => {
  loadPendingComments();
});
</script>

<style scoped>
.admin-comment-audit {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.filter-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-input {
  padding: 8px;
  width: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-btn, .reset-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filter-btn {
  background-color: #409eff;
  color: white;
}

.reset-btn {
  background-color: #909399;
  color: white;
}

.comment-list {
  border: 1px solid #eee;
  border-radius: 8px;
}

.comment-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #333;
}

.comment-score {
  color: #f5a623;
  font-weight: bold;
}

.comment-content {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 10px;
  color: #666;
  line-height: 1.6;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.pass-btn {
  background-color: #67c23a;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.reject-btn {
  background-color: #e6a23c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn {
  background-color: #f56c6c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.empty-tip {
  text-align: center;
  padding: 50px 0;
  color: #999;
}
</style>