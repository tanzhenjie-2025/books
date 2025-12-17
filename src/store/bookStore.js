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
      books.value = data;
    } catch (error) {
      console.error('加载书籍失败:', error);
      return { success: false, message: error.response?.data || '加载失败' };
    }
    return { success: true };
  };

  // 加载借阅记录
  const loadBorrowRecords = async (userId) => {
    try {
      const data = await request.get(`/borrows/user/${userId}`);
      borrowRecords.value = data;
    } catch (error) {
      console.error('加载借阅记录失败:', error);
      return { success: false, message: error.response?.data || '加载失败' };
    }
    return { success: true };
  };

  // 加载所有借阅记录（管理员）
  const loadAllBorrowRecords = async () => {
    try {
      const data = await request.get('/borrows');
      borrowRecords.value = data;
    } catch (error) {
      console.error('加载所有借阅记录失败:', error);
      return { success: false, message: error.response?.data || '加载失败' };
    }
    return { success: true };
  };

  // 加载违规记录
  const loadViolations = async (userId) => {
    try {
      const data = await request.get(`/violations/user/${userId}`);
      violations.value = data;
    } catch (error) {
      console.error('加载违规记录失败:', error);
      return { success: false, message: error.response?.data || '加载失败' };
    }
    return { success: true };
  };

  // 计算属性：带逾期状态的借阅记录
  const getBorrowRecordsWithOverdue = computed(() => {
    return borrowRecords.value.map(record => {
      if (record.returned) return { ...record, overdue: false, overdueDays: 0 };

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
        bookAuthor: book.author || '未知作者'
      };
    });
  });

  // 添加书籍
  const addBook = async (newBook) => {
    try {
      const data = await request.post('/books', newBook);
      books.value.push(data);
      return { success: true, message: '书籍添加成功！' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || '添加书籍失败'
      };
    }
  };

  // 更新书籍
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
        message: error.response?.data || '更新书籍失败'
      };
    }
  };

  // 删除书籍
  const deleteBook = async (bookId) => {
    try {
      await request.delete(`/books/${bookId}`);
      books.value = books.value.filter(book => book.id !== bookId);
      return { success: true, message: '书籍删除成功！' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || '删除书籍失败'
      };
    }
  };

  // 借阅书籍
  const borrowBook = async (userId, bookId) => {
    try {
      const data = await request.post('/borrows', {}, {
        params: { userId, bookId }
      });
      if (data.success) {
        await loadBorrowRecords(userId);
        await loadBooks();
      }
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || '借阅失败'
      };
    }
  };

  // 归还书籍
  const returnBook = async (recordId, userId) => {
    try {
      const data = await request.put(`/borrows/return/${recordId}`);
      if (data.success) {
        await loadBorrowRecords(userId);
        await loadBooks();
        await loadViolations(userId);
      }
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || '归还失败'
      };
    }
  };

  return {
    books,
    borrowRecords,
    violations,
    getBorrowRecordsWithOverdue,
    loadBooks,
    loadBorrowRecords,
    loadAllBorrowRecords,
    loadViolations,
    addBook,
    updateBook,
    deleteBook,
    borrowBook,
    returnBook
  };
});