/**
 * 用户状态管理（登录、角色、违规次数、用户管理）
 * 课程设计注释：跨组件共享用户数据，统一处理用户相关逻辑
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { mockUsers } from '@/mock/userData';

export const useUserStore = defineStore('user', () => {
  // 状态：当前登录用户（null=未登录）
  const currentUser = ref(null);
  // 状态：所有用户列表（管理员用）
  const userList = ref([...mockUsers]);

  /**
   * 登录方法
   * @param {String} username 用户名
   * @param {String} password 密码
   * @returns {Object} { success: Boolean, message: String }
   */
  const login = (username, password) => {
    // 查找用户
    const user = userList.value.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) {
      return { success: false, message: '用户名或密码错误' };
    }
    // 判断账号是否停用
    if (user.isDisabled) {
      return { success: false, message: '账号因违规≥3次已停用' };
    }
    // 登录成功，设置当前用户
    currentUser.value = { ...user };
    return { success: true, message: '登录成功' };
  };

  /**
   * 退出登录
   */
  const logout = () => {
    currentUser.value = null;
  };

  /**
   * 增加用户违规次数（超时归还时调用）
   * @param {Number} userId 用户ID
   */
  const addViolationCount = (userId) => {
    const user = userList.value.find((u) => u.id === userId);
    if (user) {
      user.violationCount += 1;
      // 违规≥3次，停用账号
      if (user.violationCount >= 3) {
        user.isDisabled = true;
        // 如果是当前登录用户，强制退出
        if (currentUser.value && currentUser.value.id === userId) {
          logout();
        }
      }
      // 更新当前用户状态（如果是当前用户）
      if (currentUser.value && currentUser.value.id === userId) {
        currentUser.value.violationCount = user.violationCount;
        currentUser.value.isDisabled = user.isDisabled;
      }
    }
  };

  /**
   * 管理员：新增用户
   * @param {Object} newUser 新用户信息
   */
  const addUser = (newUser) => {
    const maxId = Math.max(...userList.value.map((u) => u.id));
    userList.value.push({
      id: maxId + 1,
      username: newUser.username,
      password: newUser.password || '123456', // 默认密码
      role: newUser.role || 'user',
      violationCount: 0,
      isDisabled: false,
    });
  };

  /**
   * 管理员：编辑用户
   * @param {Object} editUser 编辑后的用户信息
   */
  const editUser = (editUser) => {
    const index = userList.value.findIndex((u) => u.id === editUser.id);
    if (index !== -1) {
      userList.value[index] = { ...editUser };
      // 如果编辑的是当前登录用户，更新当前用户状态
      if (currentUser.value && currentUser.value.id === editUser.id) {
        currentUser.value = { ...editUser };
      }
    }
  };

  /**
   * 管理员：删除用户
   * @param {Number} userId 用户ID
   */
  const deleteUser = (userId) => {
    // 不能删除自己
    if (currentUser.value && currentUser.value.id === userId) {
      return { success: false, message: '不能删除当前登录的账号' };
    }
    userList.value = userList.value.filter((u) => u.id !== userId);
    return { success: true, message: '删除成功' };
  };

  return {
    currentUser,
    userList,
    login,
    logout,
    addViolationCount,
    addUser,
    editUser,
    deleteUser,
  };
});