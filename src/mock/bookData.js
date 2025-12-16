/**
 * 模拟图书/借阅数据（替代数据库）
 * 课程设计注释：前端先模拟数据，后续可对接后端API
 */
export const mockBooks = [
  { id: 1, name: 'Vue.js实战', author: '尤雨溪', publish: '人民邮电出版社', stock: 5 },
  { id: 2, name: 'JavaScript高级程序设计', author: '马特·弗里斯比', publish: '人民邮电出版社', stock: 3 },
  { id: 3, name: 'HTML5权威指南', author: '亚当斯', publish: '清华大学出版社', stock: 2 },
  { id: 4, name: 'CSS揭秘', author: '勒贝尔', publish: '人民邮电出版社', stock: 4 },
  { id: 5, name: 'Node.js实战', author: '谢尔顿', publish: '人民邮电出版社', stock: 1 },
];

// 借阅记录（关联用户ID和图书ID）
export const mockBorrows = [
  {
    id: 1,
    userId: 1, // 对应user1
    bookId: 1, // 对应Vue.js实战
    borrowTime: '2025-12-01', // 借阅时间（已超时，超时时长=15天）
    isReturned: false, // 是否归还
  },
  {
    id: 2,
    userId: 1,
    bookId: 2,
    borrowTime: '2025-12-10', // 未超时（剩余2天）
    isReturned: false,
  },
  {
    id: 3,
    userId: 2,
    bookId: 3,
    borrowTime: '2025-11-20', // 已超时，超时时长=26天
    isReturned: false,
  },
];