import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  // 存储当前登录用户
  const currentUser = ref(null);

  // 模拟用户列表（初始管理员/普通用户）
  const userList = ref([
    { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
    { id: 2, username: 'user1', password: '123456', role: 'user' },
  ]);

  // 登录方法
  const login = (username, password) => {
    const user = userList.value.find(
      u => u.username === username && u.password === password
    );
    if (user) {
      currentUser.value = user;
      return { success: true, message: '登录成功！' };
    } else {
      return { success: false, message: '用户名或密码错误！' };
    }
  };

  // 退出登录
  const logout = () => {
    currentUser.value = null;
  };

  // 新增用户
  const addUser = (newUser) => {
    const newId = Math.max(...userList.value.map(u => u.id), 0) + 1;
    userList.value.push({
      id: newId,
      username: newUser.username,
      password: newUser.password || '123456', // 默认密码
      role: newUser.role || 'user'
    });
  };

  // 编辑用户
  const editUser = (editUser) => {
    const index = userList.value.findIndex(u => u.id === editUser.id);
    if (index !== -1) {
      userList.value[index] = editUser;
    }
  };

  // 删除用户
  const deleteUser = (userId) => {
    // 禁止删除最后一个管理员
    const adminCount = userList.value.filter(u => u.role === 'admin').length;
    const targetUser = userList.value.find(u => u.id === userId);

    if (targetUser?.role === 'admin' && adminCount <= 1) {
      return { success: false, message: '不能删除最后一个管理员！' };
    }

    userList.value = userList.value.filter(u => u.id !== userId);
    // 如果删除的是当前登录用户，退出登录
    if (currentUser.value?.id === userId) {
      logout();
    }
    return { success: true, message: '删除成功！' };
  };

  return {
    currentUser,
    userList,
    login,
    logout,
    addUser,
    editUser,
    deleteUser
  };
});