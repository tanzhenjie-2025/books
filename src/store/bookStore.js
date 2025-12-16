import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { calcOverdueDays, isOverdue } from '@/utils/dateUtils';

/**
 * 图书状态管理Store
 * 功能包含：书籍列表管理、借阅记录管理、超时判断、添加书籍、借阅/归还书籍、获取用户借阅记录
 */
export const useBookStore = defineStore('book', () => {
  // ========== 核心数据定义 ==========
  // 书籍列表（初始测试数据，支持管理员新增）
  const books = ref([
    {
      id: 1,
      name: 'Vue实战',
      author: '张三',
      category: '科技',
      stock: 5,
      description: 'Vue3入门到精通',
      borrowCount: 2
    },
    {
      id: 2,
      name: 'JavaScript高级程序设计',
      author: '李四',
      category: '科技',
      stock: 3,
      description: 'JS进阶书籍',
      borrowCount: 1
    },
    {
      id: 3,
      name: '三国演义',
      author: '罗贯中',
      category: '文学',
      stock: 2,
      description: '中国古典四大名著之一',
      borrowCount: 5
    },
    {
      id: 4,
      name: '水浒传',
      author: '施耐庵',
      category: '文学',
      stock: 4,
      description: '中国古典四大名著之一',
      borrowCount: 3
    },
    {
      id: 5,
      name: '机器学习入门',
      author: '王五',
      category: '科技',
      stock: 1,
      description: '机器学习基础教程',
      borrowCount: 0
    },
  ]);

  // 借阅记录（初始测试数据，补充超时相关默认值）
  const borrowRecords = ref([
    {
      id: 1,
      userId: 1,
      bookId: 1,
      borrowTime: '2025-11-01',
      returnTime: null,
      isReturned: false,
      overdue: true,
      overdueDays: 45
    },
    {
      id: 2,
      userId: 1,
      bookId: 2,
      borrowTime: '2025-12-10',
      returnTime: null,
      isReturned: false,
      overdue: false,
      overdueDays: 0
    },
    {
      id: 3,
      userId: 1,
      bookId: 3,
      borrowTime: '2025-11-05',
      returnTime: '2025-11-12',
      isReturned: true,
      overdue: false,
      overdueDays: 0
    }
  ]);

  // ========== 响应式计算属性 ==========
  /**
   * 计算所有借阅记录的实时超时状态（自动更新）
   * 逻辑：已归还的记录超时状态为false；未归还的记录超过7天则判定为超时
   */
  const getBorrowRecordsWithOverdue = computed(() => {
    return borrowRecords.value.map(record => {
      // 已归还的记录直接重置超时状态
      if (record.isReturned) return { ...record, overdue: false, overdueDays: 0 };

      // 计算借阅天数（当前时间 - 借阅时间）
      const overdue = isOverdue(record.borrowTime);
      const overdueDays = calcOverdueDays(record.borrowTime);

      return { ...record, overdue, overdueDays };
    });
  });

  // 获取所有分类
  const getAllCategories = computed(() => {
    const categories = new Set(books.value.map(book => book.category));
    return ['全部', ...Array.from(categories)];
  });

  // ========== 核心方法 ==========
  /**
   * 生成新书籍ID（自动取现有书籍最大ID+1，避免重复）
   * @returns {Number} 新书籍ID
   */
  const generateNewBookId = () => {
    if (books.value.length === 0) return 1;
    const maxId = Math.max(...books.value.map(book => book.id));
    return maxId + 1;
  };

  /**
   * 管理员添加新书籍（含重复校验：名称+作者）
   * @param {Object} newBook 新书籍信息（name/author/category/stock/description）
   * @returns {Object} {success: 布尔值, message: 提示文本}
   */
  const addBook = (newBook) => {
    // 校验：书籍名称+作者重复则添加失败
    const isExist = books.value.some(
      book => book.name === newBook.name && book.author === newBook.author
    );
    if (isExist) {
      return { success: false, message: '该书籍已存在（名称+作者重复）！' };
    }

    // 添加新书籍到列表
    books.value.push(newBook);
    return { success: true, message: '书籍添加成功！' };
  };

  /**
   * 获取指定用户的未归还借阅记录（关联书籍信息+超时状态）
   * @param {Number} userId 用户ID
   * @returns {Array} 用户借阅记录列表（含书籍名称/作者、超时状态）
   */
  const getCurrentUserBorrows = (userId) => {
    const userBorrows = getBorrowRecordsWithOverdue.value
      .filter(record => record.userId === userId && !record.isReturned)
      .map(record => {
        // 关联书籍信息（兜底：书籍不存在时显示"未知"）
        const book = books.value.find(book => book.id === record.bookId) || {};
        return {
          ...record,
          bookName: book.name || '未知书籍',
          bookAuthor: book.author || '未知作者',
          // 计算罚款金额，每天0.5元
          penalty: record.overdueDays * 0.5
        };
      });
    return userBorrows;
  };

  /**
   * 获取用户所有借阅记录（包括已归还）
   * @param {Number} userId 用户ID
   * @returns {Array} 所有借阅记录
   */
  const getAllUserBorrows = (userId) => {
    return getBorrowRecordsWithOverdue.value
      .filter(record => record.userId === userId)
      .map(record => {
        const book = books.value.find(book => book.id === record.bookId) || {};
        return {
          ...record,
          bookName: book.name || '未知书籍',
          bookAuthor: book.author || '未知作者',
          penalty: record.overdueDays * 0.5
        };
      });
  };

  /**
   * 归还书籍（标记记录为已归还 + 书籍库存+1）
   * @param {Number} borrowId 借阅记录ID
   * @returns {Object} {success: 布尔值, message: 提示文本}
   */
  const returnBook = (borrowId) => {
    // 校验：借阅记录是否存在
    const record = borrowRecords.value.find(r => r.id === borrowId);
    if (!record) {
      return { success: false, message: '借阅记录不存在！' };
    }
    // 校验：是否已归还
    if (record.isReturned) {
      return { success: false, message: '该书籍已归还！' };
    }

    // 标记记录为已归还
    record.isReturned = true;
    record.returnTime = new Date().toISOString().split('T')[0];

    // 对应书籍库存+1
    const book = books.value.find(b => b.id === record.bookId);
    if (book) book.stock += 1;

    // 如果有逾期，增加违规次数
    if (record.overdueDays > 0) {
      const userStore = useUserStore();
      userStore.addViolationCount(record.userId);
    }

    return { success: true, message: '书籍归还成功！' };
  };

  /**
   * 借阅书籍（生成借阅记录 + 书籍库存-1）
   * @param {Number} userId 用户ID
   * @param {Number} bookId 书籍ID
   * @returns {Object} {success: 布尔值, message: 提示文本}
   */
  const borrowBook = (userId, bookId) => {
    // 校验：书籍是否存在
    const book = books.value.find(b => b.id === bookId);
    if (!book) {
      return { success: false, message: '书籍不存在！' };
    }
    // 校验：书籍库存是否充足
    if (book.stock <= 0) {
      return { success: false, message: '书籍库存不足！' };
    }

    // 校验：用户是否已经借阅了这本书且未归还
    const hasBorrowed = borrowRecords.value.some(
      r => r.userId === userId && r.bookId === bookId && !r.isReturned
    );
    if (hasBorrowed) {
      return { success: false, message: '您已借阅过这本书，未归还前不能再次借阅！' };
    }

    // 生成新借阅记录（自动初始化超时状态）
    const newRecord = {
      id: borrowRecords.value.length + 1,
      userId,
      bookId,
      borrowTime: new Date().toISOString().split('T')[0], // 格式：YYYY-MM-DD
      returnTime: null,
      isReturned: false,
      overdue: false,
      overdueDays: 0,
    };
    borrowRecords.value.push(newRecord);

    // 书籍库存-1 + 借阅次数+1
    book.stock -= 1;
    book.borrowCount += 1;

    return { success: true, message: '书籍借阅成功！请在7天内归还，超期将产生罚款。' };
  };

  /**
   * 搜索图书
   * @param {String} keyword 搜索关键词
   * @param {String} category 分类筛选
   * @returns {Array} 符合条件的图书
   */
  const searchBooks = (keyword, category) => {
    return books.value.filter(book => {
      const matchesKeyword = book.name.includes(keyword) || book.author.includes(keyword);
      const matchesCategory = category === '全部' || book.category === category;
      return matchesKeyword && matchesCategory;
    });
  };

  // ========== 导出供外部使用的属性/方法 ==========
  return {
    // 核心数据
    books,
    borrowRecords,
    // 计算属性
    getBorrowRecordsWithOverdue,
    getAllCategories,
    // 方法
    generateNewBookId,
    addBook,
    getCurrentUserBorrows,
    getAllUserBorrows,
    returnBook,
    borrowBook,
    searchBooks,
  };
});