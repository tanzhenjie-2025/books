import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '@/utils/request';

export const useBookStore = defineStore('book', () => {
  // 核心数据
  const books = ref([]);
  const borrowRecords = ref([]);
  const violations = ref([]);

  // 加载所有书籍（强制ID为数字类型）
  const loadBooks = async () => {
    try {
      const data = await request.get('/books');
      // 核心修复：强制所有书籍ID转为数字，避免类型不匹配
      books.value = (data || []).map(book => ({
        ...book,
        id: Number(book.id), // 强制转数字
        stock: Number(book.stock),
        borrowCount: Number(book.borrowCount)
      }));
      console.log("【书籍列表】加载完成（ID已转数字）：", books.value);
      return { success: true };
    } catch (error) {
      console.error('加载书籍失败:', error);
      return {
        success: false,
        message: error.message || '加载书籍失败'
      };
    }
  };

  // 加载指定用户的借阅记录（强制bookId为数字）
  const loadBorrowRecords = async (userId) => {
    if (!userId) {
      return { success: false, message: '用户ID不能为空' };
    }
    try {
      const data = await request.get(`/borrows/user/${userId}`);
      // 核心修复：强制借阅记录的bookId、userId、id转为数字
      borrowRecords.value = (data || []).map(record => ({
        ...record,
        id: Number(record.id),
        bookId: Number(record.bookId), // 关键：bookId转数字
        userId: Number(record.userId),
        returned: !!record.returned, // 强制布尔值
        isReturned: !!record.returned // 兼容字段
      }));
      console.log("【借阅记录】加载完成（ID已转数字）：", borrowRecords.value);
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
      borrowRecords.value = (data || []).map(record => ({
        ...record,
        id: Number(record.id),
        bookId: Number(record.bookId),
        userId: Number(record.userId),
        returned: !!record.returned,
        isReturned: !!record.returned
      }));
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

  // 计算属性：带逾期状态+书籍信息的借阅记录（终极修复）
  const getBorrowRecordsWithOverdue = computed(() => {
    return borrowRecords.value.map(record => {
      // 第一步：强制bookId为数字（双重保险）
      const recordBookId = Number(record.bookId);
      // 第二步：精准匹配书籍（ID类型一致）
      const book = books.value.find(book => Number(book.id) === recordBookId) || {};
      
      console.log(`【关联书籍】recordId=${record.id}，recordBookId=${recordBookId}，匹配到书籍：`, book);

      // 第三步：判断是否归还（兼容字段）
      const isReturned = !!record.returned || !!record.isReturned;

      // 已归还记录
      if (isReturned) {
        return {
          ...record,
          overdue: false,
          overdueDays: 0,
          bookName: book.name || '未知书籍',
          bookAuthor: book.author || '未知作者',
          isReturned: true,
          returned: true,
          remainingDays: 0,
          borrowTime: record.borrowTime ? new Date(record.borrowTime).toLocaleDateString() : '未知时间'
        };
      }

      // 未归还记录：计算逾期和剩余天数
      const borrowDate = record.borrowTime ? new Date(record.borrowTime) : new Date();
      const nowDate = new Date();
      const diffTime = nowDate - borrowDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const overdue = diffDays > 7;
      const overdueDays = overdue ? diffDays - 7 : 0;
      const remainingDays = Math.max(0, 7 - diffDays); // 确保剩余天数不为负

      return {
        ...record,
        overdue,
        overdueDays,
        remainingDays,
        bookName: book.name || '未知书籍',
        bookAuthor: book.author || '未知作者',
        isReturned: false,
        returned: false,
        borrowTime: record.borrowTime ? new Date(record.borrowTime).toLocaleDateString() : '未知时间'
      };
    });
  });

  // 补充：获取当前用户未归还的借阅记录
  const getCurrentUserBorrows = (userId) => {
    if (!userId) return [];
    const userIdNum = Number(userId);
    return getBorrowRecordsWithOverdue.value.filter(
      record => !record.isReturned && Number(record.userId) === userIdNum
    );
  };

  // 添加书籍（管理员）
  const addBook = async (newBook) => {
    try {
      const data = await request.post('/books', newBook);
      books.value.push({
        ...data,
        id: Number(data.id),
        stock: Number(data.stock),
        borrowCount: Number(data.borrowCount || 0)
      });
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
      const bookIdNum = Number(book.id);
      const index = books.value.findIndex(b => Number(b.id) === bookIdNum);
      if (index !== -1) {
        books.value[index] = {
          ...data,
          id: Number(data.id),
          stock: Number(data.stock),
          borrowCount: Number(data.borrowCount)
        };
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
      const bookIdNum = Number(bookId);
      await request.delete(`/books/${bookIdNum}`);
      books.value = books.value.filter(book => Number(book.id) !== bookIdNum);
      return { success: true, message: '书籍删除成功！' };
    } catch (error) {
      return {
        success: false,
        message: error.message || '删除书籍失败'
      };
    }
  };

  // 借阅书籍
  const borrowBook = async (userId, bookId) => {
    const userIdNum = Number(userId);
    const bookIdNum = Number(bookId);
    
    if (!userIdNum || !bookIdNum) {
      return { success: false, message: '用户ID和书籍ID不能为空' };
    }

    const targetBook = books.value.find(b => Number(b.id) === bookIdNum);
    if (!targetBook) {
      return { success: false, message: '书籍不存在' };
    }
    if (Number(targetBook.stock) <= 0) {
      return { success: false, message: '书籍库存不足，无法借阅' };
    }

    try {
      const data = await request.post('/borrows', null, {
        params: { userId: userIdNum, bookId: bookIdNum }
      });

      if (data.success) {
        await loadBorrowRecords(userIdNum);
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

  // 归还书籍（确保刷新顺序 + 类型统一）
  const returnBook = async (recordId, userId) => {
    const recordIdNum = Number(recordId);
    const userIdNum = Number(userId);
    
    if (!recordIdNum || !userIdNum) {
      return { success: false, message: '记录ID和用户ID不能为空' };
    }
    
    try {
      const data = await request.put(`/borrows/return/${recordIdNum}`);
      if (data.success) {
        // 先刷新书籍，再刷新借阅记录（确保数据最新）
        await loadBooks(); 
        await loadBorrowRecords(userIdNum); 
        await loadViolations(userIdNum);
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

  // 续借书籍方法
  const renewBook = async (recordId, userId) => {
    const recordIdNum = Number(recordId);
    const userIdNum = Number(userId);
    
    if (!recordIdNum || !userIdNum) {
      return { success: false, message: '记录ID和用户ID不能为空' };
    }
    
    try {
      const data = await request.put(`/borrows/renew/${recordIdNum}`, null, {
        params: { userId: userIdNum }
      });
      if (data.success) {
        await loadBorrowRecords(userIdNum);
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

  // 获取用户所有借阅记录（类型统一）
  const getAllUserBorrows = (userId) => {
    if (!userId) return [];
    const userIdNum = Number(userId);
    return getBorrowRecordsWithOverdue.value.filter(record => Number(record.userId) === userIdNum);
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
    returnBook,
    renewBook,
    getAllUserBorrows,
    getCurrentUserBorrows
  };
});