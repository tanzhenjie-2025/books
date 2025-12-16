<template>
  <div class="book-comment-page">
    <!-- 书籍基础信息 -->
    <div class="book-header">
      <h2 class="book-title">{{ book?.name || '加载中...' }}</h2>
      <p class="book-subtitle">作者：{{ book?.author }} | 出版社：{{ book?.publish }}</p>
      <button class="back-btn" @click="$router.go(-1)">返回图书列表</button>
    </div>

    <!-- 评论提交表单 -->
    <div class="comment-form-card" v-if="book">
      <h3 class="form-title">发表评论</h3>
      <textarea
        v-model="newComment"
        placeholder="请输入评论内容（最多200字）..."
        class="comment-input"
        maxlength="200"
      ></textarea>
      <div class="form-footer">
        <span class="word-count">{{ newComment.length }}/200</span>
        <button
          class="submit-btn"
          @click="handleSubmitComment"
          :disabled="!newComment.trim()"
        >
          提交评论
        </button>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list-card" v-if="book">
      <h3 class="list-title">评论列表（{{ book.comments.length }}条）</h3>

      <div class="comment-list" v-if="book.comments.length > 0">
        <div class="comment-item" v-for="(comment, index) in book.comments" :key="index">
          <div class="comment-header">
            <span class="username">{{ comment.username }}</span>
            <span class="time">{{ comment.time }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
        </div>
      </div>

      <div class="empty-comment" v-if="book.comments.length === 0">
        暂无评论，快来发表第一条评论吧！
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useBookStore } from '../store/bookStore';
import { useUserStore } from '../store/userStore';

// 路由参数
const route = useRoute();
const bookStore = useBookStore();
const userStore = useUserStore();

// 响应式数据
const book = ref(null);
const newComment = ref('');

// 初始化书籍信息
const initBookInfo = () => {
  const bookId = route.params.bookId;
  book.value = bookStore.getBookDetail(bookId);

  if (!book.value) {
    alert('书籍不存在！');
    $router.go(-1);
  }
};

// 提交评论
const handleSubmitComment = () => {
  if (!newComment.value.trim()) return;

  const res = bookStore.addBookComment(
    book.value.id,
    userStore.currentUser.id,
    userStore.currentUser.username,
    newComment.value.trim()
  );

  alert(res.message);
  if (res.success) {
    newComment.value = '';
    // 重新获取书籍信息（刷新评论列表）
    initBookInfo();
  }
};

// 页面挂载时初始化
onMounted(() => {
  initBookInfo();
});
</script>

<style scoped>
.book-comment-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* 书籍头部信息 */
.book-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #409eff;
}

.book-title {
  font-size: 24px;
  color: #1f2937;
  margin: 0 0 10px 0;
}

.book-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 15px 0;
}

.back-btn {
  padding: 8px 16px;
  border: 1px solid #409eff;
  border-radius: 6px;
  background-color: #ffffff;
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background-color: #f0f7ff;
}

/* 评论表单 */
.comment-form-card {
  background-color: #f9fafb;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 30px;
  border: 1px solid #e4e7ed;
}

.form-title {
  font-size: 16px;
  color: #1f2937;
  margin: 0 0 15px 0;
}

.comment-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.comment-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.word-count {
  font-size: 12px;
  color: #9ca3af;
}

.submit-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  background-color: #67c23a;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background-color: #85ce61;
}

.submit-btn:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

/* 评论列表 */
.comment-list-card {
  background-color: #f9fafb;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.list-title {
  font-size: 16px;
  color: #1f2937;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  padding: 15px;
  background-color: #ffffff;
  border-radius: 6px;
  border: 1px solid #f3f4f6;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
}

.time {
  font-size: 12px;
  color: #9ca3af;
}

.comment-content {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

/* 空评论提示 */
.empty-comment {
  text-align: center;
  padding: 30px;
  font-size: 14px;
  color: #9ca3af;
  background-color: #ffffff;
  border-radius: 6px;
  border: 1px dashed #e4e7ed;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .book-comment-page {
    padding: 20px 15px;
  }

  .comment-form-card, .comment-list-card {
    padding: 20px 15px;
  }
}
</style>