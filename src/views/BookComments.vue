<template>
  <div class="book-comments-page">
    <button class="back-btn" @click="$router.back()">返回</button>
    <h2 class="page-title">{{ book?.name }} 的评价</h2>
    <p class="book-info">作者：{{ book?.author }} | 出版社：{{ book?.publish }}</p>
    <p class="book-rating">平均评分：{{ book?.avgScore || 0 }} ({{ book?.commentCount || 0 }}条评价)</p>

    <!-- 评论提交表单 -->
    <div class="comment-form card" v-if="userStore.currentUser">
      <h3 class="form-title">发表评价</h3>
      <div class="rating-container">
        <label>评分：</label>
        <div class="stars">
          <span
            v-for="star in 5"
            :key="star"
            @click="setScore(star)"
            :class="{ 'star-active': score >= star }"
          >★</span>
        </div>
      </div>
      <textarea
        v-model="commentContent"
        placeholder="请输入您的评价内容（可选）..."
        class="comment-input"
        maxlength="500"
      ></textarea>
      <div class="form-footer">
        <span class="word-count">{{ commentContent.length }}/500</span>
        <button
          class="submit-btn"
          @click="submitComment"
          :disabled="score === 0 || !userStore.currentUser"
        >
          提交评价
        </button>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comments-list">
      <h3>评价列表</h3>
      <div class="comment-item" v-for="comment in bookComments" :key="comment.id">
        <div class="comment-header">
          <span class="comment-username">{{ userStore.currentUser.id === comment.userId ? userStore.currentUser.username : '其他用户' }}</span>
          <span class="comment-rating">
            <span v-for="star in 5" :key="star" :class="{ 'star-filled': comment.score >= star }">★</span>
          </span>
          <!-- 显示待审核状态 -->
          <span class="comment-audit" v-if="!comment.isAudit">【待审核】</span>
          <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
        </div>
        <div class="comment-content">{{ comment.content || '无评价内容' }}</div>
      </div>
      <div class="empty-tip" v-if="bookComments.length === 0">
        暂无评价，快来发表第一条评价吧！
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useBookStore } from '@/store/bookStore';
import { useUserStore } from '@/store/userStore';

const route = useRoute();
const bookStore = useBookStore();
const userStore = useUserStore();

// 获取当前书籍ID
const bookId = parseInt(route.params.id);

// 响应式数据
const book = ref(null);
const bookComments = ref([]);
const commentContent = ref('');
const score = ref(0);

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// 设置评分
const setScore = (star) => {
  score.value = star;
};

// 提交评价
const submitComment = async () => {
  if (!userStore.currentUser) {
    alert('请先登录！');
    return;
  }

  if (score.value === 0) {
    alert('请给出评分！');
    return;
  }

  const result = await bookStore.addBookComment({
    userId: userStore.currentUser.id,
    bookId: bookId,
    score: score.value,
    content: commentContent.value.trim()
  });

  alert(result.message);
  if (result.success) {
    // 重置表单并刷新评论列表
    score.value = 0;
    commentContent.value = '';
    await loadComments();
    await bookStore.loadBooks(); // 刷新书籍信息以更新评分
  }
};

// 加载评论
const loadComments = async () => {
  const result = await bookStore.getBookComments(bookId);
  if (result.success) {
    bookComments.value = result.data;
  } else {
    alert(result.message);
  }
};

// 加载书籍信息
const loadBookInfo = () => {
  book.value = bookStore.books.find(b => b.id === bookId) || null;
};

// 页面挂载时初始化
onMounted(async () => {
  await bookStore.loadBooks();
  loadBookInfo();
  await loadComments();
});

// 监听书籍数据变化，更新当前书籍信息
watch(() => bookStore.books, loadBookInfo);
</script>

<style scoped>
.book-comments-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 20px;
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.page-title {
  color: #333;
  margin-bottom: 8px;
}

.book-info {
  color: #666;
  margin-bottom: 4px;
}

.book-rating {
  color: #f5a623;
  margin-bottom: 20px;
  font-weight: bold;
}

.comment-form {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.form-title {
  margin-top: 0;
  color: #333;
}

.rating-container {
  margin-bottom: 15px;
}

.stars {
  font-size: 24px;
  color: #ddd;
  display: inline-block;
}

.star-active {
  color: #f5a623;
  cursor: pointer;
}

.comment-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  min-height: 100px;
  resize: vertical;
  margin-bottom: 10px;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.word-count {
  color: #999;
  font-size: 14px;
}

.submit-btn {
  padding: 8px 16px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.comments-list {
  margin-top: 30px;
}

.comment-item {
  border-bottom: 1px solid #e4e7ed;
  padding: 15px 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.comment-username {
  font-weight: bold;
  color: #333;
  margin-right: 8px;
}

.comment-rating {
  color: #f5a623;
  margin-right: 8px;
}

.comment-audit {
  color: #ff9800;
  font-size: 12px;
  font-weight: bold;
  margin-right: 8px;
}

.star-filled {
  color: #f5a623;
}

.comment-time {
  color: #999;
  font-size: 14px;
}

.comment-content {
  color: #666;
  line-height: 1.6;
}

.empty-tip {
  text-align: center;
  padding: 50px 0;
  color: #999;
}
</style>