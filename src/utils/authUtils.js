/**
 * 权限工具类：判断登录状态、管理员身份
 * 课程设计注释：封装权限逻辑，统一控制页面访问权限
 */
import { useUserStore } from '@/store/userStore';

/**
 * 判断是否已登录
 * @returns {Boolean} true=已登录，false=未登录
 */
export const isLogin = () => {
  const userStore = useUserStore();
  return !!userStore.currentUser;
};

/**
 * 判断是否为管理员
 * @returns {Boolean} true=管理员，false=普通用户
 * 【修改点】：将 'admin' 修正为 'ROLE_ADMIN'，与其他文件角色命名统一
 */
export const isAdmin = () => {
  const userStore = useUserStore();
  if (!userStore.currentUser) return false;
  return userStore.currentUser.role === 'ROLE_ADMIN';
};

/**
 * 判断账号是否被停用（违规≥3次）
 * @returns {Boolean} true=已停用，false=正常
 */
export const isAccountDisabled = () => {
  const userStore = useUserStore();
  if (!userStore.currentUser) return false;
  return userStore.currentUser.violationCount >= 3;
};