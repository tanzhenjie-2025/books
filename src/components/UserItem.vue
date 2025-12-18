<template>
  <div class="user-item list-item">
    <div class="user-info">
      <p><strong>ID：</strong>{{ user.id }}</p>
      <p><strong>用户名：</strong>{{ user.username }}</p>
      <p><strong>角色：</strong>{{ user.role === 'admin' ? '管理员' : '普通用户' }}</p>
    </div>
    <div class="action-buttons">
<!--      <button class="btn btn-primary edit-btn" @click="handleEdit">编辑</button>-->
      <button class="btn btn-danger delete-btn" @click="handleDelete">删除</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

const emit = defineEmits(['edit', 'delete']);

const handleEdit = () => {
  emit('edit', props.user);
};

const handleDelete = () => {
  emit('delete', props.user.id);
};
</script>

<style scoped>
.user-item {
  background: #f9fafb;
  border-radius: 4px;
  margin-bottom: 10px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e4e7ed;
}

.user-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.edit-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  cursor: pointer;
}

.edit-btn:hover {
  background: #66b1ff;
}

.delete-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #f56c6c;
  color: #fff;
  cursor: pointer;
}

.delete-btn:hover {
  background: #f78989;
}
</style>