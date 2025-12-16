import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useBookStore = defineStore('book', () => {
  // 书籍列表
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

  // 新增：评论数据
  const comments = ref([
    {
      id: 1,
      bookId: 1,
      userId: 1,
      username: 'admin',
      content: '这本书很棒！',
      time: '2025-12-01'
    }
  ]);

  // 计算属性：借阅记录超时状态
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

  // 添加新书籍
  const addBook = (newBook) => {
    const isExist = books.value.some(
      book => book.name === newBook.name && book.author === newBook.author
    );
    if (isExist) {
      return { success: false, message: '该书籍已存在（名称+作者重复）！' };
    }

    books.value.push(newBook);
    return { success: true, message: '书籍添加成功！' };
  };

  // 新增：添加评论
  const addComment = (bookId, userId, username, content) => {
    const newComment = {
      id: comments.value.length + 1,
      bookId,
      userId,
      username,
      content,
      time: new Date().toISOString().split('T')[0]
    };
    comments.value.push(newComment);
    return { success: true, message: '评论成功' };
  };

  // 新增：获取书籍的所有评论
  const getBookComments = (bookId) => {
    return comments.value.filter(comment => comment.bookId === bookId);
  };

  // 获取用户借阅记录
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

  // 借阅书籍
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

  return {
    books,
    borrowRecords,
    comments,
    getBorrowRecordsWithOverdue,
    generateNewBookId,
    addBook,
    addComment,
    getBookComments,
    getCurrentUserBorrows,
    returnBook,
    borrowBook,
  };
});