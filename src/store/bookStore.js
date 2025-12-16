import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useBookStore = defineStore('book', () => {
  // 书籍列表（含借阅次数+评论）
  const books = ref([
    {
      id: 1,
      name: 'Vue实战',
      author: '张三',
      category: '科技',
      stock: 5,
      description: 'Vue3入门到精通',
      borrowCount: 2,
      publish: '人民邮电出版社',
      comments: [
        { userId: 1, username: 'admin', content: '这本书讲得很详细！', time: '2025-12-01' },
        { userId: 2, username: 'user1', content: '新手友好，推荐！', time: '2025-12-05' }
      ]
    },
    {
      id: 2,
      name: 'JavaScript高级程序设计',
      author: '李四',
      category: '科技',
      stock: 3,
      description: 'JS进阶书籍',
      borrowCount: 1,
      publish: '人民邮电出版社',
      comments: [
        { userId: 1, username: 'admin', content: '经典中的经典', time: '2025-12-08' }
      ]
    },
  ]);

  // 借阅记录
  const borrowRecords = ref([
    {
      id: 1,
      userId: 1,
      bookId: 1,
      borrowTime: '2025-11-01',
      isReturned: false,
      overdue: true,
      overdueDays: 45
    },
    {
      id: 2,
      userId: 1,
      bookId: 2,
      borrowTime: '2025-12-10',
      isReturned: false,
      overdue: false,
      overdueDays: 0
    },
  ]);

  // 计算实时超时状态
  const getBorrowRecordsWithOverdue = computed(() => {
    return borrowRecords.value.map(record => {
      if (record.isReturned) return { ...record, overdue: false, overdueDays: 0 };

      const borrowDate = new Date(record.borrowTime);
      const nowDate = new Date();
      const diffTime = nowDate - borrowDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const overdue = diffDays > 7;
      const overdueDays = overdue ? diffDays - 7 : 0;

      return { ...record, overdue, overdueDays };
    });
  });

  // 生成新书籍ID
  const generateNewBookId = () => {
    if (books.value.length === 0) return 1;
    const maxId = Math.max(...books.value.map(book => book.id));
    return maxId + 1;
  };

  // 添加书籍
  const addBook = (newBook) => {
    const isExist = books.value.some(
      book => book.name === newBook.name && book.author === newBook.author
    );
    if (isExist) {
      return { success: false, message: '该书籍已存在（名称+作者重复）！' };
    }
    books.value.push({ ...newBook, comments: [] });
    return { success: true, message: '书籍添加成功！' };
  };

  // 新增：修改书籍库存
  const updateBookStock = (bookId, newStock) => {
    const book = books.value.find(b => b.id === bookId);
    if (!book) {
      return { success: false, message: '书籍不存在！' };
    }
    if (newStock < 0) {
      return { success: false, message: '库存数量不能为负数！' };
    }
    book.stock = newStock;
    return { success: true, message: '库存修改成功！' };
  };

  // 获取用户未归还借阅记录
  const getCurrentUserBorrows = (userId) => {
    const userBorrows = getBorrowRecordsWithOverdue.value
      .filter(record => record.userId === userId && !record.isReturned)
      .map(record => {
        const book = books.value.find(book => book.id === record.bookId) || {};
        return {
          ...record,
          bookName: book.name || '未知书籍',
          bookAuthor: book.author || '未知作者',
        };
      });
    return userBorrows;
  };

  // 归还书籍
  const returnBook = (borrowId) => {
    const record = borrowRecords.value.find(r => r.id === borrowId);
    if (!record) {
      return { success: false, message: '借阅记录不存在！' };
    }
    if (record.isReturned) {
      return { success: false, message: '该书籍已归还！' };
    }

    record.isReturned = true;
    const book = books.value.find(b => b.id === record.bookId);
    if (book) book.stock += 1;

    return { success: true, message: '书籍归还成功！' };
  };

  // 借阅书籍（借阅次数+1）
  const borrowBook = (userId, bookId) => {
    const book = books.value.find(b => b.id === bookId);
    if (!book) {
      return { success: false, message: '书籍不存在！' };
    }
    if (book.stock <= 0) {
      return { success: false, message: '书籍库存不足！' };
    }

    const newRecord = {
      id: borrowRecords.value.length + 1,
      userId,
      bookId,
      borrowTime: new Date().toISOString().split('T')[0],
      isReturned: false,
      overdue: false,
      overdueDays: 0,
    };
    borrowRecords.value.push(newRecord);

    book.stock -= 1;
    book.borrowCount += 1;

    return { success: true, message: '书籍借阅成功！' };
  };

  // 续借功能
  const renewBook = (borrowId) => {
    const record = borrowRecords.value.find(r => r.id === borrowId);
    if (!record) {
      return { success: false, message: '借阅记录不存在！' };
    }
    if (record.isReturned) {
      return { success: false, message: '该书籍已归还，无法续借！' };
    }

    const borrowDate = new Date(record.borrowTime);
    const nowDate = new Date();
    const diffTime = nowDate - borrowDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remainingDays = 7 - diffDays;

    if (remainingDays >= 3) {
      return { success: false, message: `剩余天数${remainingDays}天，大于3天，无法续借！` };
    }

    const newBorrowDate = new Date(borrowDate);
    newBorrowDate.setDate(newBorrowDate.getDate() + 7);
    record.borrowTime = newBorrowDate.toISOString().split('T')[0];

    return { success: true, message: '书籍续借成功，延长7天借阅时间！' };
  };

  // 可视化统计数据
  const getBorrowStats = () => {
    const categoryStats = {};
    const bookStats = books.value.map(book => ({
      name: book.name,
      count: book.borrowCount || 0
    })).sort((a, b) => b.count - a.count);

    books.value.forEach(book => {
      if (!categoryStats[book.category]) {
        categoryStats[book.category] = 0;
      }
      categoryStats[book.category] += book.borrowCount || 0;
    });

    return {
      categoryStats,
      bookStats,
      totalBorrows: books.value.reduce((sum, book) => sum + (book.borrowCount || 0), 0),
      totalBooks: books.value.length
    };
  };

  // 添加书籍评论
  const addBookComment = (bookId, userId, username, content) => {
    const book = books.value.find(b => b.id === bookId);
    if (!book) return { success: false, message: '书籍不存在！' };

    book.comments.push({
      userId,
      username,
      content,
      time: new Date().toISOString().split('T')[0]
    });
    return { success: true, message: '评论添加成功！' };
  };

  // 获取单本书籍详情（含评论）
  const getBookDetail = (bookId) => {
    return books.value.find(b => b.id === Number(bookId)) || null;
  };

  return {
    books,
    borrowRecords,
    getBorrowRecordsWithOverdue,
    generateNewBookId,
    addBook,
    updateBookStock, // 导出修改库存方法
    getCurrentUserBorrows,
    returnBook,
    borrowBook,
    renewBook,
    getBorrowStats,
    addBookComment,
    getBookDetail // 导出获取书籍详情方法
  };
});