import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '@/utils/request';

export const useBookStore = defineStore('book', () => {
  // 核心数据
  const books = ref([]);
  const borrowRecords = ref([]);
  const violations = ref([]);

  // 加载所有书籍
  const loadBooks = async () => {
    try {
      const data = await request.get('/books');
      books.value = data || []; // 兜底空数组
      return { success: true };
    } catch (error) {
      console.error('加载书籍失败:', error);
      return {
        success: false,
        message: error.message || '加载书籍失败'
      };
    }
  };

  // 加载指定用户的借阅记录
  const loadBorrowRecords = async (userId) => {
    if (!userId) {
      return { success: false, message: '用户ID不能为空' };
    }
    try {
      const data = await request.get(`/borrows/user/${userId}`);
      borrowRecords.value = data || [];
      return { success: true };
    } catch (error) {
      console.error('加载借阅记录失败:', error);
      return {
        success: false,
        message: error.message || '加载借阅记录失败'
      };
    }
  };

  // 加载所有借阅记录（管理员）
  const loadAllBorrowRecords = async () => {
    try {
      const data = await request.get('/borrows');
      borrowRecords.value = data || [];
      return { success: true };
    } catch (error) {
      console.error('加载所有借阅记录失败:', error);
      return {
        success: false,
        message: error.message || '加载所有借阅记录失败'
      };
    }
  };

  // 加载指定用户的违规记录
  const loadViolations = async (userId) => {
    if (!userId) {
      return { success: false, message: '用户ID不能为空' };
    }
    try {
      const data = await request.get(`/violations/user/${userId}`);
      violations.value = data || [];
      return { success: true };
    } catch (error) {
      console.error('加载违规记录失败:', error);
      return {
        success: false,
        message: error.message || '加载违规记录失败'
      };
    }
  };

  // 计算属性：带逾期状态+书籍信息的借阅记录
  const getBorrowRecordsWithOverdue = computed(() => {
    return borrowRecords.value.map(record => {
      // 已归还的记录直接返回
      if (record.returned) {
        return {
          ...record,
          overdue: false,
          overdueDays: 0,
          bookName: '未知书籍',
          bookAuthor: '未知作者'
        };
      }

      // 计算逾期天数
      const borrowDate = new Date(record.borrowTime);
      const nowDate = new Date();
      const diffTime = nowDate - borrowDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const overdue = diffDays > 7;
      const overdueDays = overdue ? diffDays - 7 : 0;

      // 关联书籍信息
      const book = books.value.find(book => book.id === record.bookId) || {};

      return {
        ...record,
        overdue,
        overdueDays,
        bookName: book.name || '未知书籍',
        bookAuthor: book.author || '未知作者',
        // 兼容后端字段（isReturned ↔ returned）
        isReturned: record.returned
      };
    });
  });

  // 补充：获取当前用户未归还的借阅记录（修复my-borrow调用）
  const getCurrentUserBorrows = (userId) => {
    if (!userId) return [];
    return getBorrowRecordsWithOverdue.value.filter(
      record => !record.returned && record.userId === userId
    );
  };

  // 添加书籍（管理员）
  const addBook = async (newBook) => {
    try {
      const data = await request.post('/books', newBook);
      books.value.push(data);
      return { success: true, message: '书籍添加成功！' };
    } catch (error) {
      return {
        success: false,
        message: error.message || '添加书籍失败'
      };
    }
  };

  // 更新书籍（管理员）
  const updateBook = async (book) => {
    try {
      const data = await request.put('/books', book);
      const index = books.value.findIndex(b => b.id === book.id);
      if (index !== -1) {
        books.value[index] = data;
      }
      return { success: true, message: '书籍更新成功！' };
    } catch (error) {
      return {
        success: false,
        message: error.message || '更新书籍失败'
      };
    }
  };

  // 删除书籍（管理员）
  const deleteBook = async (bookId) => {
    try {
      await request.delete(`/books/${bookId}`);
      books.value = books.value.filter(book => book.id !== bookId);
      return { success: true, message: '书籍删除成功！' };
    } catch (error) {
      return {
        success: false,
        message: error.message || '删除书籍失败'
      };
    }
  };

  // 借阅书籍（核心修复：参数传递 + 错误处理）
  const borrowBook = async (userId, bookId) => {
    // 前置校验
    if (!userId || !bookId) {
      return { success: false, message: '用户ID和书籍ID不能为空' };
    }

    // 检查书籍库存
    const targetBook = books.value.find(b => b.id === bookId);
    if (!targetBook) {
      return { success: false, message: '书籍不存在' };
    }
    if (targetBook.stock <= 0) {
      return { success: false, message: '书籍库存不足，无法借阅' };
    }

    try {
      // 优化：POST请求body传null（后端接收参数是@RequestParam）
      const data = await request.post('/borrows', null, {
        params: { userId, bookId }
      });

      // 借阅成功后刷新数据
      if (data.success) {
        await loadBorrowRecords(userId);
        await loadBooks();
      }
      return {
        success: data.success,
        message: data.message || '借阅成功'
      };
    } catch (error) {
      const errMsg = error.message || `借阅失败：${error.response?.data?.message || '服务器错误'}`;
      console.error('借阅书籍失败:', errMsg);
      return {
        success: false,
        message: errMsg
      };
    }
  };

  // 归还书籍
  const returnBook = async (recordId, userId) => {
    if (!recordId || !userId) {
      return { success: false, message: '记录ID和用户ID不能为空' };
    }
    try {
      const data = await request.put(`/borrows/return/${recordId}`);
      if (data.success) {
        await loadBorrowRecords(userId);
        await loadBooks();
        await loadViolations(userId);
      }
      return {
        success: data.success,
        message: data.message || '归还成功'
      };
    } catch (error) {
      console.error('归还书籍失败:', error);
      return {
        success: false,
        message: error.message || '归还书籍失败'
      };
    }
  };

  // 新增：续借书籍方法
  const renewBook = async (recordId, userId) => {
    if (!recordId || !userId) {
      return { success: false, message: '记录ID和用户ID不能为空' };
    }
    try {
      const data = await request.put(`/borrows/renew/${recordId}`, null, {
        params: { userId }
      });
      if (data.success) {
        await loadBorrowRecords(userId);
      }
      return {
        success: data.success,
        message: data.message || '续借成功'
      };
    } catch (error) {
      console.error('续借书籍失败:', error);
      return {
        success: false,
        message: error.message || '续借失败（仅可续借1次，且未逾期）'
      };
    }
  };

  // 补充：获取用户所有借阅记录（修复BorrowHistoryPage调用的方法）
  const getAllUserBorrows = (userId) => {
    if (!userId) return [];
    // 先加载再返回（确保数据最新）
    return getBorrowRecordsWithOverdue.value.filter(record => record.userId === userId);
  };

  return {
    // 数据
    books,
    borrowRecords,
    violations,
    getBorrowRecordsWithOverdue,
    // 方法
    loadBooks,
    loadBorrowRecords,
    loadAllBorrowRecords,
    loadViolations,
    addBook,
    updateBook,
    deleteBook,
    borrowBook,
    returnBook,
    renewBook, // 导出续借方法
    getAllUserBorrows,
    getCurrentUserBorrows // 导出未归还记录方法
  };
});