<template>
  <div class="book-detail-page">
    <button class="btn btn-primary back-btn" @click="$router.back()">返回</button>
    <div class="book-detail card" v-if="book">
      <h2 class="book-title">{{ book.name }}</h2>
      <div class="book-info">
        <p><strong>作者：</strong>{{ book.author }}</p>
        <p><strong>分类：</strong>{{ book.category }}</p>
        <p><strong>库存：</strong>{{ book.stock }} 本</p>
        <p><strong>借阅次数：</strong>{{ book.borrowCount }} 次</p>
        <p><strong>简介：</strong>{{ book.description }}</p>
      </div>
      <!-- 修复：使用统一的按钮状态判断 -->
      <button
        class="btn btn-primary borrow-btn"
        @click="handleBorrow"
        :disabled="borrowBtnDisabled"
      >
        {{ borrowBtnText }}
      </button>
    </div>
    <div class="empty-tip" v-else>
      图书信息不存在
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useBookStore } from '@/store/bookStore';
import { useUserStore } from '@/store/userStore';

const route = useRoute();
const bookStore = useBookStore();
const userStore = useUserStore();
const book = ref(null);

// 计算属性：处理当前用户启用状态
const currentUserEnabled = computed(() => {
  const enabled = userStore.currentUser?.enabled;
  if (enabled === undefined || enabled === null) return true;
  return typeof enabled === 'string' ? enabled === 'true' : !!enabled;
});

// 计算属性：判断是否是管理员
const isAdmin = computed(() => {
  return userStore.currentUser?.role === 'ROLE_ADMIN';
});

// 计算属性：借阅按钮禁用状态
const borrowBtnDisabled = computed(() => {
  if (!book.value) return true;
  if (!userStore.currentUser) return true;
  if (isAdmin.value) return book.value.stock <= 0;
  if (!currentUserEnabled.value) return true;
  if (userStore.currentUser.violationCount >= 3) return true;
  return book.value.stock <= 0;
});

// 计算属性：借阅按钮显示文字
const borrowBtnText = computed(() => {
  if (!userStore.currentUser) return '请先登录';
  if (isAdmin.value) return book.value?.stock > 0 ? '立即借阅' : '库存不足';
  if (!currentUserEnabled.value) return '账号已被禁用';
  if (userStore.currentUser.violationCount >= 3) return '违规次数过多';
  return book.value?.stock > 0 ? '立即借阅' : '库存不足';
});

const initBook = () => {
  const bookId = parseInt(route.params.id);
  book.value = bookStore.books.find(b => b.id === bookId) || null;
};

// 处理借阅
const handleBorrow = async () => {
  if (!userStore.currentUser) {
    alert('请先登录！');
    return;
  }

  // 管理员直接借阅
  if (isAdmin.value) {
    const { success, message } = await bookStore.borrowBook(
      userStore.currentUser.id,
      book.value.id
    );
    alert(message);
    if (success) initBook();
    return;
  }

  // 普通用户检查
  if (!currentUserEnabled.value) {
    alert('您的账号已被禁用，无法借阅书籍！');
    return;
  }

  if (userStore.currentUser.violationCount >= 3) {
    alert('您的违规次数已达3次，暂不能借阅书籍！');
    return;
  }

  const { success, message } = await bookStore.borrowBook(
    userStore.currentUser.id,
    book.value.id
  );
  alert(message);
  if (success) {
    initBook();
  }
};

onMounted(initBook);
</script>

<style scoped>
.book-detail-page {
  padding: 20px;
}

.back-btn {
  margin-bottom: 20px;
}

.book-detail {
  max-width: 800px;
  margin: 0 auto;
}

.book-title {
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.book-info {
  margin-bottom: 30px;
  line-height: 1.8;
  font-size: 16px;
}

.borrow-btn {
  display: block;
  margin: 0 auto;
  padding: 10px 20px;
  font-size: 16px;
}

.empty-tip {
  text-align: center;
  font-size: 18px;
  color: #999;
  margin-top: 50px;
}
</style>