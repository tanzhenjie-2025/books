import { defineStore } from 'pinia';
import { ref } from 'vue';
import request from '@/utils/request';

export const useUserStore = defineStore('user', () => {
  // 核心数据（从localStorage初始化，防止刷新丢失）
  const currentUser = ref(JSON.parse(localStorage.getItem('user')) || null);
  const token = ref(localStorage.getItem('token') || null);
  const userList = ref([]);

  // 登录方法（核心：正确保存Token和用户信息）
  const login = async (username, password) => {
    try {
      // 调用后端登录接口 /api/auth/login
      const data = await request.post('/auth/login', { username, password });

      // 验证返回数据完整性
      if (!data.id || !data.token) {
        throw new Error('登录响应数据不完整');
      }

      // 存储用户信息（包含Token），补充违规次数和启用状态的类型转换
      currentUser.value = {
        id: data.id,
        username: data.username,
        role: data.role || 'ROLE_USER', // 兜底默认角色
        violationCount: Number(data.violationCount || 0), // 强制转数字
        enabled: data.enabled === undefined ? true : (typeof data.enabled === 'string' ? data.enabled === 'true' : !!data.enabled)
      };
      token.value = data.token;

      // 持久化到本地存储
      localStorage.setItem('user', JSON.stringify(currentUser.value));
      localStorage.setItem('token', data.token);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || '登录失败，请检查用户名或密码'
      };
    }
  };

  // 注册方法
  const register = async (userInfo) => {
    try {
      await request.post('/auth/register', userInfo);
      return { success: true, message: '注册成功，请登录' };
    } catch (error) {
      return {
        success: false,
        message: error.message || '注册失败'
      };
    }
  };

  // 注销方法（清空所有数据）
  const logout = () => {
    currentUser.value = null;
    token.value = null;
    userList.value = [];
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // 加载所有用户（管理员权限）
  const loadAllUsers = async () => {
    try {
      const data = await request.get('/users');
      // 强制转换用户数据类型，避免后续校验出错
      userList.value = (data || []).map(user => ({
        ...user,
        id: Number(user.id),
        violationCount: Number(user.violationCount || 0),
        enabled: user.enabled === undefined ? true : (typeof user.enabled === 'string' ? user.enabled === 'true' : !!user.enabled)
      }));
      return { success: true };
    } catch (error) {
      console.error('加载用户列表失败:', error);
      return { success: false, message: error.message };
    }
  };

  // 兼容别名：解决bookStore中调用loadUserList的错误
  const loadUserList = loadAllUsers;

  // 更新用户信息
  const updateUser = async (user) => {
    try {
      const data = await request.put('/users', user);
      // 更新用户列表
      const index = userList.value.findIndex(u => u.id === user.id);
      if (index !== -1) {
        userList.value[index] = {
          ...data,
          id: Number(data.id),
          violationCount: Number(data.violationCount || 0),
          enabled: data.enabled === undefined ? true : (typeof data.enabled === 'string' ? data.enabled === 'true' : !!data.enabled)
        };
      }
      // 更新当前登录用户信息
      if (currentUser.value && currentUser.value.id === user.id) {
        currentUser.value = {
          ...data,
          id: Number(data.id),
          violationCount: Number(data.violationCount || 0),
          enabled: data.enabled === undefined ? true : (typeof data.enabled === 'string' ? data.enabled === 'true' : !!data.enabled)
        };
        localStorage.setItem('user', JSON.stringify(currentUser.value));
      }
      return { success: true, message: '用户更新成功' };
    } catch (error) {
      return {
        success: false,
        message: error.message || '更新用户失败'
      };
    }
  };

  // 切换用户启用/禁用状态
  const toggleUserStatus = async (userId, enabled) => {
    try {
      await request.put(`/users/${userId}/status`, { enabled });
      // 更新本地列表
      const index = userList.value.findIndex(u => u.id === userId);
      if (index !== -1) {
        userList.value[index].enabled = enabled;
      }
      // 同步更新当前用户状态
      if (currentUser.value && currentUser.value.id === userId) {
        currentUser.value.enabled = enabled;
        localStorage.setItem('user', JSON.stringify(currentUser.value));
      }
      return { success: true, message: enabled ? '用户已启用' : '用户已禁用' };
    } catch (error) {
      return {
        success: false,
        message: error.message || '操作失败'
      };
    }
  };

  // 增加用户违规次数
  const increaseViolation = async (userId) => {
    try {
      await request.put(`/users/${userId}/violation`);
      // 更新本地列表
      const index = userList.value.findIndex(u => u.id === userId);
      if (index !== -1) {
        userList.value[index].violationCount = (userList.value[index].violationCount || 0) + 1;
        // 违规次数≥3时自动禁用（和后端逻辑同步）
        if (userList.value[index].violationCount >= 3) {
          userList.value[index].enabled = false;
          // 同步更新当前用户
          if (currentUser.value && currentUser.value.id === userId) {
            currentUser.value.enabled = false;
            currentUser.value.violationCount = userList.value[index].violationCount;
            localStorage.setItem('user', JSON.stringify(currentUser.value));
          }
        }
      }
      return { success: true, message: '违规次数已增加' };
    } catch (error) {
      return {
        success: false,
        message: error.message || '操作失败'
      };
    }
  };

  // 补充：重置用户违规次数（后端有该接口，前端对应补充）
  const resetViolationCount = async (userId) => {
    try {
      await request.put(`/users/${userId}/violation/reset`);
      const index = userList.value.findIndex(u => u.id === userId);
      if (index !== -1) {
        userList.value[index].violationCount = 0;
        // 同步更新当前用户
        if (currentUser.value && currentUser.value.id === userId) {
          currentUser.value.violationCount = 0;
          localStorage.setItem('user', JSON.stringify(currentUser.value));
        }
      }
      return { success: true, message: '违规次数已重置' };
    } catch (error) {
      return {
        success: false,
        message: error.message || '操作失败'
      };
    }
  };

  return {
    currentUser,
    token,
    userList,
    login,
    register,
    logout,
    loadAllUsers,
    loadUserList, // 关键：添加兼容别名，解决bookStore调用错误
    updateUser,
    toggleUserStatus,
    increaseViolation,
    resetViolationCount
  };
});