/**
 * 模拟图书/借阅数据（替代数据库）
 * 课程设计注释：前端先模拟数据，后续可对接后端API
 */
export const mockBooks = [
  { id: 1, name: 'Vue.js实战', author: '尤雨溪', publish: '人民邮电出版社', stock: 5, avgScore: 4.5, commentCount: 12 },
  { id: 2, name: 'JavaScript高级程序设计', author: '马特·弗里斯比', publish: '人民邮电出版社', stock: 3, avgScore: 4.8, commentCount: 23 },
  { id: 3, name: 'HTML5权威指南', author: '亚当斯', publish: '清华大学出版社', stock: 2, avgScore: 4.2, commentCount: 8 },
  { id: 4, name: 'CSS揭秘', author: '勒贝尔', publish: '人民邮电出版社', stock: 4, avgScore: 4.7, commentCount: 15 },
  { id: 5, name: 'Node.js实战', author: '谢尔顿', publish: '人民邮电出版社', stock: 1, avgScore: 4.0, commentCount: 5 },
];

// 新增模拟评价数据
export const mockComments = [
  {
    id: 1,
    userId: 1,
    bookId: 1,
    username: 'user1',
    score: 5,
    content: '非常好的Vue.js入门书籍，推荐！',
    isAudit: true,
    createTime: '2025-11-15'
  },
  {
    id: 2,
    userId: 2,
    bookId: 1,
    username: 'user2',
    score: 4,
    content: '内容详实，适合有一定基础的开发者',
    isAudit: true,
    createTime: '2025-11-20'
  },
  {
    id: 3,
    userId: 1,
    bookId: 2,
    username: 'user1',
    score: 5,
    content: 'JavaScript开发者必备圣经',
    isAudit: true,
    createTime: '2025-12-05'
  }
];

// 借阅记录（关联用户ID和图书ID）
export const mockBorrows = [
  // 原有借阅记录保持不变
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