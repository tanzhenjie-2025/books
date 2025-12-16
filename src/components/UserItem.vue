<template>
  <div class="user-item list-item">
    <div class="user-info">
      <p class="user-id"><strong>ID：</strong>{{ user.id }}</p>
      <p class="user-username"><strong>用户名：</strong>{{ user.username }}</p>
      <p class="user-role"><strong>角色：</strong>{{ user.role === 'admin' ? '管理员' : '普通用户' }}</p>
      <p class="user-violation"><strong>违规次数：</strong>{{ user.violationCount }} 次</p>
      <p class="user-status">
        <strong>状态：</strong>
        <span :style="{ color: user.isDisabled ? '#f56c6c' : '#67c23a' }">
          {{ user.isDisabled ? '已停用' : '正常' }}
        </span>
      </p>
    </div>
    <div class="user-actions">
      <button class="btn btn-primary edit-btn" @click="handleEdit">编辑</button>
      <button
        class="btn btn-danger delete-btn"
        @click="handleDelete"
        :disabled="user.isDisabled"
      >
        {{ user.isDisabled ? '已删除' : '删除' }}
      </button>
    </div>

    <!-- 编辑用户弹窗（隐藏） -->
    <div class="edit-modal" v-if="showEditModal">
      <div class="edit-modal-content">
        <h3>编辑用户</h3>
        <div class="form-item">
          <label>用户名：</label>
          <input v-model="editUser.username" placeholder="请输入用户名" />
        </div>
        <div class="form-item">
          <label>角色：</label>
          <select v-model="editUser.role">
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div class="form-item">
          <label>违规次数：</label>
          <input
            v-model.number="editUser.violationCount"
            type="number"
            min="0"
            placeholder="请输入违规次数"
          />
        </div>
        <div class="form-item">
          <label>状态：</label>
          <select v-model="editUser.isDisabled">
            <option :value="false">正常</option>
            <option :value="true">停用</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-success" @click="confirmEdit">确认</button>
          <button class="btn btn-danger" @click="cancelEdit">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 用户项组件：展示单个用户信息，提供编辑/删除按钮，编辑弹窗
 * 课程设计注释：管理员核心操作组件，支持修改用户角色、违规次数、状态
 */
import { defineProps, defineEmits, ref } from 'vue';

// 1. 接收props：用户信息（修正：规范的Props声明）
const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

// 2. 定义事件：edit（编辑）、delete（删除）（核心修复：用defineEmits替代错误的emit声明）
const emit = defineEmits(['edit', 'delete']);

// 编辑弹窗状态
const showEditModal = ref(false);
// 编辑用户数据（深拷贝原用户）
const editUser = ref({ ...props.user });

/**
 * 触发编辑弹窗
 */
const handleEdit = () => {
  showEditModal.value = true;
  // 重置编辑数据
  editUser.value = { ...props.user };
};

/**
 * 触发删除事件
 */
const handleDelete = () => {
  emit('delete', props.user.id);
};

/**
 * 确认编辑
 */
const confirmEdit = () => {
  if (!editUser.value.username) {
    alert('请输入用户名');
    return;
  }
  emit('edit', editUser.value);
  showEditModal.value = false;
};

/**
 * 取消编辑
 */
const cancelEdit = () => {
  showEditModal.value = false;
};
</script>

<style scoped>
.user-item {
  background: #f9fafb;
  border-radius: 4px;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.user-id,
.user-username,
.user-role,
.user-violation,
.user-status {
  margin: 0;
  color: #333;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.delete-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 编辑弹窗样式 */
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.edit-modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

.edit-modal-content h3 {
  margin-bottom: 20px;
  color: #409eff;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
</style>