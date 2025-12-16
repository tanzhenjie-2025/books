/**
 * 模拟用户数据（替代数据库）
 * 课程设计注释：前端先模拟数据，后续可对接后端API
 */
export const mockUsers = [
  // 普通用户（违规1次）
  {
    id: 1,
    username: 'user1',
    password: '123456',
    role: 'user', // 普通用户
    violationCount: 1, // 违规次数
    isDisabled: false, // 账号状态（违规≥3次为true）
  },
  // 普通用户（违规3次，已停用）
  {
    id: 2,
    username: 'user2',
    password: '123456',
    role: 'user',
    violationCount: 3,
    isDisabled: true,
  },
  // 管理员
  {
    id: 3,
    username: 'admin',
    password: 'admin123',
    role: 'admin', // 管理员
    violationCount: 0,
    isDisabled: false,
  },
];