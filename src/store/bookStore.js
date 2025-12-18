import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '@/utils/request';
import { useUserStore } from '@/store/userStore';

export const useBookStore = defineStore('book', () => {
  // 核心数据
  const books = ref([]);
  const borrowRecords = ref([]);
  const violations = ref([]);

  // 加载所有书籍（强制ID为数字类型）
  const loadBooks = async () => {
    try {
      const data = await request.get('/books');
      books.value = (data || []).map(book => ({
        ...book,
        id: Number(book.id),
        stock: Number(book.stock),
        borrowCount: Number(book.borrowCount || 0),
        avgScore: Number(book.avgScore || 0),
        commentCount: Number(book.commentCount || 0)
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
      borrowRecords.value = (data || []).map(record => ({
        ...record,
        id: Number(record.id),
        bookId: Number(record.bookId),
        userId: Number(record.userId),
        returned: !!record.returned,
        isReturned: !!record.returned
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

  // 获取书籍评价
  const getBookComments = async (bookId) => {
    if (!bookId) {
      return { success: false, message: '书籍ID不能为空' };
    }

    try {
      const data = await request.get(`/comments/book/${bookId}`);
      return {
        success: data.success,
        message: data.message || '获取评价成功',
        data: data.data || []
      };
    } catch (error) {
      const errMsg = error.message || `获取评价失败：${error.response?.data?.message || '服务器错误'}`;
      console.error('获取书籍评价失败:', errMsg);
      return {
        success: false,
        message: errMsg
      };
    }
  };

  // 添加书籍评价
  const addBookComment = async (comment) => {
    if (!comment.userId || !comment.bookId || comment.score === undefined) {
      return { success: false, message: '用户ID、书籍ID和评分不能为空' };
    }

    if (comment.score < 1 || comment.score > 5) {
      return { success: false, message: '评分必须在1-5之间' };
    }

    try {
      const data = await request.post('/comments', comment);
      if (data.success) {
        await loadBooks();
      }
      return {
        success: data.success,
        message: data.message || '评价提交成功，等待审核'
      };
    } catch (error) {
      const errMsg = error.message || `提交评价失败：${error.response?.data?.message || '服务器错误'}`;
      console.error('添加书籍评价失败:', errMsg);
      return {
        success: false,
        message: errMsg
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
        isReturned: !!record.returned,
        overdue: !!record.overdue,
        overdueDays: Number(record.overdueDays || 0)
      }));
      console.log("【所有借阅记录】加载完成（ID已转数字）：", borrowRecords.value);
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
      const recordBookId = Number(record.bookId);
      const book = books.value.find(book => Number(book.id) === recordBookId) || {};
      console.log(`【关联书籍】recordId=${record.id}，recordBookId=${recordBookId}，匹配到书籍：`, book);

      const isReturned = !!record.returned || !!record.isReturned;

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

      const borrowDate = record.borrowTime ? new Date(record.borrowTime) : new Date();
      const nowDate = new Date();
      const diffTime = nowDate - borrowDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const overdue = diffDays > 7;
      const overdueDays = overdue ? diffDays - 7 : 0;
      const remainingDays = Math.max(0, 7 - diffDays);

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

  // 核心新增：借阅统计计算属性
  const getBorrowStats = computed(() => {
    const totalBooks = books.value.length;
    const totalBorrows = borrowRecords.value.length;
    const returnedCount = borrowRecords.value.filter(item => item.isReturned).length;
    const unReturnedCount = totalBorrows - returnedCount;
    const overdueCount = borrowRecords.value.filter(item => item.overdue).length;

    const bookStats = books.value.map(book => {
      const borrowCount = borrowRecords.value.filter(
        record => Number(record.bookId) === Number(book.id)
      ).length;
      return {
        id: book.id,
        name: book.name,
        author: book.author,
        borrowCount: borrowCount,
        stock: book.stock,
        avgScore: book.avgScore || 0,
        commentCount: book.commentCount || 0
      };
    }).sort((a, b) => b.borrowCount - a.borrowCount);

    const categoryStats = {};
    books.value.forEach(book => {
      const categoryBorrows = borrowRecords.value.filter(
        record => Number(record.bookId) === Number(book.id)
      ).length;
      if (categoryStats[book.category]) {
        categoryStats[book.category] += categoryBorrows;
      } else {
        categoryStats[book.category] = categoryBorrows;
      }
    });
    const categoryStatsList = Object.keys(categoryStats).map(category => ({
      category: category,
      count: categoryStats[category]
    })).sort((a, b) => b.count - a.count);

    const dateMap = {};
    borrowRecords.value.forEach(record => {
      if (!record.borrowTime) return;
      const borrowMonth = new Date(record.borrowTime).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit'
      });
      dateMap[borrowMonth] = (dateMap[borrowMonth] || 0) + 1;
    });
    const trendStats = Object.keys(dateMap).sort().map(month => ({
      month: month,
      count: dateMap[month]
    }));

    return {
      totalBooks,
      totalBorrows,
      returnedCount,
      unReturnedCount,
      overdueCount,
      bookStats,
      categoryStatsList,
      trendStats
    };
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
        borrowCount: Number(data.borrowCount || 0),
        avgScore: Number(data.avgScore || 0),
        commentCount: Number(data.commentCount || 0)
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
      const bookToUpdate = {
        ...book,
        id: Number(book.id),
        stock: Number(book.stock)
      };
      const data = await request.put('/books', bookToUpdate);
      const bookIdNum = Number(book.id);
      const index = books.value.findIndex(b => Number(b.id) === bookIdNum);
      if (index !== -1) {
        books.value[index] = {
          ...data,
          id: Number(data.id),
          stock: Number(data.stock),
          borrowCount: Number(data.borrowCount || 0),
          avgScore: Number(data.avgScore || 0),
          commentCount: Number(data.commentCount || 0)
        };
      }
      return { success: true, message: '书籍更新成功！' };
    } catch (error) {
      console.error('更新书籍失败:', error);
      return {
        success: false,
        message: error.message || '更新书籍失败'
      };
    }
  };

  // 单独更新库存的方法
  const updateBookStock = async (bookId, newStock) => {
    try {
      const bookIdNum = Number(bookId);
      const stockNum = Number(newStock);
      if (isNaN(bookIdNum) || isNaN(stockNum) || stockNum < 0) {
        return { success: false, message: '库存必须是大于等于0的数字！' };
      }

      const book = books.value.find(b => Number(b.id) === bookIdNum);
      if (!book) {
        return { success: false, message: '书籍不存在！' };
      }

      const updateData = {
        ...book,
        stock: stockNum
      };

      return await updateBook(updateData);
    } catch (error) {
      console.error('更新库存失败:', error);
      return {
        success: false,
        message: error.message || '更新库存失败'
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

  // 辅助方法：处理用户启用状态（修复核心）
  const getUserEnabledStatus = (user) => {
    if (!user) return false;
    // 处理undefined/null/字符串/布尔值
    const enabled = user.enabled;
    if (enabled === undefined || enabled === null) return true;
    return typeof enabled === 'string' ? enabled === 'true' : !!enabled;
  };

  // 借阅书籍（核心修复：完善用户状态判断+管理员豁免）
  const borrowBook = async (userId, bookId) => {
    const userIdNum = Number(userId);
    const bookIdNum = Number(bookId);

    if (!userIdNum || !bookIdNum) {
      return { success: false, message: '用户ID和书籍ID不能为空' };
    }

    // 获取用户Store
    const userStore = useUserStore();

    // 查找目标用户
    const targetUser = userStore.userList.find(u => Number(u.id) === userIdNum) || userStore.currentUser;
    if (!targetUser) {
      return { success: false, message: '用户不存在！' };
    }

    // 管理员豁免所有限制
    if (targetUser.role === 'ROLE_ADMIN') {
      // 仅检查书籍库存
      const targetBook = books.value.find(b => Number(b.id) === bookIdNum);
      if (!targetBook) {
        return { success: false, message: '书籍不存在' };
      }
      if (Number(targetBook.stock) <= 0) {
        return { success: false, message: '书籍库存不足，无法借阅' };
      }

      // 执行借阅
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
        console.error('管理员借阅书籍失败:', errMsg);
        return {
          success: false,
          message: errMsg
        };
      }
    }

    // 普通用户检查
    // 检查账号启用状态（修复：使用处理后的状态）
    const isEnabled = getUserEnabledStatus(targetUser);
    if (!isEnabled) {
      return { success: false, message: '您的账号已被禁用，无法借阅书籍！' };
    }

    // 检查违规次数
    const violationCount = Number(targetUser.violationCount || 0);
    if (violationCount >= 3) {
      return { success: false, message: '您的违规次数已达3次，暂不能借阅书籍！' };
    }

    // 检查书籍
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

  // 归还书籍
  const returnBook = async (recordId, userId) => {
    const recordIdNum = Number(recordId);
    const userIdNum = Number(userId);

    if (!recordIdNum || !userIdNum) {
      return { success: false, message: '记录ID和用户ID不能为空' };
    }

    try {
      const data = await request.put(`/borrows/return/${recordIdNum}`);
      if (data.success) {
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

  // 获取用户所有借阅记录
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
    getBorrowStats,
    loadBooks,
    loadBorrowRecords,
    loadAllBorrowRecords,
    loadViolations,
    addBook,
    updateBook,
    updateBookStock,
    deleteBook,
    borrowBook,
    returnBook,
    renewBook,
    getAllUserBorrows,
    getCurrentUserBorrows,
    getBookComments,
    addBookComment
  };
});