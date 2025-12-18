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
          :disabled="borrowBtnDisabled"
        >
          {{ borrowBtnText }}
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
import { defineProps, defineEmits, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';

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
// 用户Store
const userStore = useUserStore();

// 计算属性：当前用户启用状态
const currentUserEnabled = computed(() => {
  const enabled = userStore.currentUser?.enabled;
  if (enabled === undefined || enabled === null) return true;
  return typeof enabled === 'string' ? enabled === 'true' : !!enabled;
});

// 计算属性：是否是管理员（强化判断 + 日志）
const isAdmin = computed(() => {
  const role = userStore.currentUser?.role || '';
  console.log('[列表项] 用户角色：', role);
  return role === 'ROLE_ADMIN';
});

// 计算属性：借阅按钮禁用状态（强化类型转换 + 日志）
const borrowBtnDisabled = computed(() => {
  const violationCount = Number(userStore.currentUser?.violationCount || 0);
  const stock = Number(props.book.stock || 0);
  // 调试日志
  console.log('[列表项] 按钮禁用校验：', {
    hasUser: !!userStore.currentUser,
    isAdmin: isAdmin.value,
    userEnabled: currentUserEnabled.value,
    violationCount: violationCount,
    stock: stock,
    violationOverLimit: violationCount >= 3
  });

  if (!userStore.currentUser) return true; // 未登录
  if (isAdmin.value) return stock <= 0; // 管理员仅校验库存
  if (!currentUserEnabled.value) return true; // 账号禁用
  if (violationCount >= 3) return true; // 违规≥3次（核心拦截）
  return stock <= 0; // 库存不足
});

// 计算属性：借阅按钮显示文字（强化类型转换）
const borrowBtnText = computed(() => {
  if (!userStore.currentUser) return '请先登录';
  if (isAdmin.value) return Number(props.book.stock || 0) > 0 ? '借阅' : '库存不足';

  const violationCount = Number(userStore.currentUser.violationCount || 0);
  if (violationCount >= 3) return '违规次数过多';
  if (!currentUserEnabled.value) return '账号已禁用';
  return Number(props.book.stock || 0) > 0 ? '借阅' : '库存不足';
});

// 处理借书（前置校验 + 强化类型转换）
const handleBorrow = async () => {
  if (!userStore.currentUser) {
    alert('请先登录！');
    return;
  }

  // 普通用户前置校验（防止绕过按钮禁用）
  if (!isAdmin.value) {
    const violationCount = Number(userStore.currentUser.violationCount || 0);
    if (violationCount >= 3) {
      alert(`您的违规次数已达${violationCount}次，暂不能借阅书籍！`);
      return;
    }
    if (!currentUserEnabled.value) {
      alert('您的账号已被禁用，无法借阅书籍！');
      return;
    }
  }

  // 触发父组件的借阅事件
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