<template>
  <div class="book-comments-page">
    <h2 class="page-title">{{ book?.name }} 的评论</h2>

    <!-- 评论表单 -->
    <div class="comment-form card">
      <textarea
        v-model="commentContent"
        placeholder="请输入您的评论..."
        class="comment-input"
      ></textarea>
      <button
        class="btn btn-primary"
        @click="submitComment"
        :disabled="!commentContent.trim()"
      >
        提交评论
      </button>
    </div>

    <!-- 评论列表 -->
    <div class="comments-list">
      <h3>评论列表</h3>
      <div class="comment-item" v-for="comment in bookComments" :key="comment.id">
        <div class="comment-header">
          <span class="comment-username">{{ comment.username }}</span>
          <span class="comment-time">{{ comment.time }}</span>
        </div>
        <div class="comment-content">{{ comment.content }}</div>
      </div>
      <div class="empty-tip" v-if="bookComments.length === 0">
        暂无评论，快来发表第一条评论吧！
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useBookStore } from '@/store/bookStore';
import { useUserStore } from '@/store/userStore';

const route = useRoute();
const bookStore = useBookStore();
const userStore = useUserStore();

// 获取当前书籍ID
const bookId = parseInt(route.params.id);

// 当前书籍信息
const book = ref(null);

// 评论内容
const commentContent = ref('');

// 书籍评论列表
const bookComments = ref([]);

// 初始化数据
const initData = () => {
  // 获取书籍信息
  book.value = bookStore.books.find(b => b.id === bookId) || null;

  // 获取评论列表
  bookComments.value = bookStore.getBookComments(bookId);
};

// 提交评论
const submitComment = () => {
  const currentUser = userStore.currentUser;
  if (!currentUser) {
    alert('请先登录');
    return;
  }

  if (!commentContent.value.trim()) {
    alert('请输入评论内容');
    return;
  }

  bookStore.addComment(
    bookId,
    currentUser.id,
    currentUser.username,
    commentContent.value.trim()
  );

  // 清空输入框并刷新评论列表
  commentContent.value = '';
  bookComments.value = bookStore.getBookComments(bookId);
};

onMounted(initData);
</script>

<style scoped>
.book-comments-page {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.page-title {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}

.comment-form {
  margin-bottom: 30px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.comment-input {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-bottom: 10px;
  resize: vertical;
}

.comments-list {
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.comment-item {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.comment-username {
  font-weight: bold;
  color: #409eff;
}

.comment-time {
  color: #999;
}

.comment-content {
  color: #333;
  line-height: 1.6;
}

.empty-tip {
  text-align: center;
  padding: 50px 0;
  color: #999;
}
</style>