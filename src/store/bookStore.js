import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '@/utils/request';
import { useUserStore } from '@/store/userStore';

export const useBookStore = defineStore('book', () => {
  // ==================== 核心数据 ====================
  const books = ref([]);               // 首页展示（未下架）
  const adminBooks = ref([]);          // 管理端全部书籍
  const borrowRecords = ref([]);
  const violations = ref([]);

  // ==================== 加载方法 ====================

  // 加载所有未下架书籍（首页用）
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
      return { success: false, message: error.message || '加载书籍失败' };
    }
  };

  // 加载管理员全量书籍（含已下架）
  const loadAdminBooks = async () => {
    try {
      const data = await request.get('/books/admin/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      adminBooks.value = (data || []).map(book => ({
        ...book,
        id: Number(book.id),
        stock: Number(book.stock),
        borrowCount: Number(book.borrowCount || 0),
        deleted: book.deleted === true || book.deleted === 'true'
      }));
      console.log("【管理书籍列表】加载完成（含下架）:", adminBooks.value);
      return { success: true };
    } catch (error) {
      console.error('加载管理书籍失败:', error);
      return { success: false, message: error.message };
    }
  };

  // 加载指定用户的借阅记录
  const loadBorrowRecords = async (userId) => {
    if (!userId) return { success: false, message: '用户ID不能为空' };
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
      return { success: true };
    } catch (error) {
      console.error('加载借阅记录失败:', error);
      return { success: false, message: error.message };
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
      return { success: true };
    } catch (error) {
      console.error('加载所有借阅记录失败:', error);
      return { success: false, message: error.message };
    }
  };

  // 加载指定用户的违规记录
  const loadViolations = async (userId) => {
    if (!userId) return { success: false, message: '用户ID不能为空' };
    try {
      const data = await request.get(`/violations/user/${userId}`);
      violations.value = data || [];
      return { success: true };
    } catch (error) {
      console.error('加载违规记录失败:', error);
      return { success: false, message: error.message };
    }
  };

  // ==================== 增删改 ====================

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
      return { success: false, message: error.message || '添加书籍失败' };
    }
  };

  // 全字段更新书籍（调用 PUT /books/{id}）
  const updateBook = async (book) => {
    try {
      const bookData = {
        name: book.name,
        author: book.author,
        category: book.category,
        stock: Number(book.stock),
        publish: book.publish,
        description: book.description
      };
      await request.put(`/books/${book.id}`, bookData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // 刷新管理列表和首页列表
      await loadAdminBooks();
      await loadBooks();
      return { success: true, message: '修改成功' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // 快捷库存更新（调用 /books/{id}/stock）
  const updateBookStock = async (bookId, newStock) => {
    try {
      await request.put(`/books/${bookId}/stock`, null, {
        params: { stock: Number(newStock) },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await loadAdminBooks();
      await loadBooks();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // 物理删除（保留原有功能）
  const deleteBook = async (bookId) => {
    try {
      await request.delete(`/books/${Number(bookId)}`);
      books.value = books.value.filter(book => Number(book.id) !== Number(bookId));
      return { success: true, message: '书籍删除成功！' };
    } catch (error) {
      return { success: false, message: error.message || '删除书籍失败' };
    }
  };

  // 下架（软删除）
  const softDeleteBook = async (id) => {
    await request.put(`/books/${id}/soft-delete`, null, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    await loadAdminBooks();
    await loadBooks();
  };

  // 上架（恢复）
  const restoreBook = async (id) => {
    await request.put(`/books/${id}/restore`, null, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    await loadAdminBooks();
    await loadBooks();
  };

  // ==================== 借阅操作（保持不变） ====================

  const borrowBook = async (userId, bookId) => {
    const userIdNum = Number(userId);
    const bookIdNum = Number(bookId);
    if (!userIdNum || !bookIdNum) return { success: false, message: '用户ID和书籍ID不能为空' };

    const userStore = useUserStore();
    try {
      if (typeof userStore.loadUserList === 'function') {
        await userStore.loadUserList();
      } else if (typeof userStore.loadAllUsers === 'function') {
        await userStore.loadAllUsers();
      }
    } catch (err) {
      console.warn('刷新用户数据失败（不影响基础校验）:', err.message);
    }

    const targetUser = userStore.userList.find(u => Number(u.id) === userIdNum) || userStore.currentUser;
    if (!targetUser) return { success: false, message: '用户不存在！' };

    const userRole = targetUser.role || '';
    const userEnabled = targetUser.enabled === undefined || targetUser.enabled === null ? true :
                        typeof targetUser.enabled === 'string' ? targetUser.enabled === 'true' : !!targetUser.enabled;
    const violationCount = Number(targetUser.violationCount || 0);

    if (userRole !== 'ROLE_ADMIN') {
      if (violationCount >= 3) return { success: false, message: `您的违规次数已达${violationCount}次，暂不能借阅书籍！` };
      if (!userEnabled) return { success: false, message: '您的账号已被禁用，无法借阅书籍！' };
    }

    const targetBook = books.value.find(b => Number(b.id) === bookIdNum);
    if (!targetBook) return { success: false, message: '书籍不存在' };
    if (Number(targetBook.stock) <= 0) return { success: false, message: '书籍库存不足，无法借阅' };

    try {
      const data = await request.post('/borrows', null, { params: { userId: userIdNum, bookId: bookIdNum } });
      if (data.success) {
        await loadBorrowRecords(userIdNum);
        await loadBooks();
      }
      return { success: data.success, message: data.message || '借阅成功' };
    } catch (error) {
      const errMsg = error.message || `借阅失败：${error.response?.data?.message || '服务器错误'}`;
      return { success: false, message: errMsg };
    }
  };

  const returnBook = async (recordId, userId) => {
    const recordIdNum = Number(recordId);
    const userIdNum = Number(userId);
    if (!recordIdNum || !userIdNum) return { success: false, message: '记录ID和用户ID不能为空' };

    try {
      const data = await request.put(`/borrows/return/${recordIdNum}`);
      if (data.success) {
        await loadBooks();
        await loadBorrowRecords(userIdNum);
        await loadViolations(userIdNum);
      }
      return { success: data.success, message: data.message || '归还成功' };
    } catch (error) {
      return { success: false, message: error.message || '归还书籍失败' };
    }
  };

  const renewBook = async (recordId, userId) => {
    const recordIdNum = Number(recordId);
    const userIdNum = Number(userId);
    if (!recordIdNum || !userIdNum) return { success: false, message: '记录ID和用户ID不能为空' };

    try {
      const data = await request.put(`/borrows/renew/${recordIdNum}`, null, { params: { userId: userIdNum } });
      if (data.success) await loadBorrowRecords(userIdNum);
      return { success: data.success, message: data.message || '续借成功' };
    } catch (error) {
      return { success: false, message: error.message || '续借失败（仅可续借1次，且未逾期）' };
    }
  };

  // ==================== 评论相关 ====================

  const getBookComments = async (bookId) => {
    if (!bookId) return { success: false, message: '书籍ID不能为空' };
    try {
      const data = await request.get(`/comments/book/${bookId}`);
      return {
        success: data.success,
        message: data.message || '获取评价成功',
        data: data.data || []
      };
    } catch (error) {
      return { success: false, message: error.message || '获取评价失败' };
    }
  };

  const addBookComment = async (comment) => {
    if (!comment.userId || !comment.bookId || comment.score === undefined)
      return { success: false, message: '用户ID、书籍ID和评分不能为空' };
    if (comment.score < 1 || comment.score > 5) return { success: false, message: '评分必须在1-5之间' };

    try {
      const data = await request.post('/comments', comment);
      if (data.success) await loadBooks();
      return { success: data.success, message: data.message || '评价提交成功，等待审核' };
    } catch (error) {
      return { success: false, message: error.message || '提交评价失败' };
    }
  };

  // ==================== 计算属性（保持不变） ====================

  const getBorrowRecordsWithOverdue = computed(() => { /* 原有代码不变 */ });
  const getBorrowStats = computed(() => { /* 原有代码不变 */ });
  const getCurrentUserBorrows = (userId) => { /* 原有代码不变 */ };
  const getAllUserBorrows = (userId) => { /* 原有代码不变 */ };

  // ==================== 返回所有状态和方法 ====================
  return {
    books,
    adminBooks,                  // 管理端全部书籍
    borrowRecords,
    violations,
    getBorrowRecordsWithOverdue,
    getBorrowStats,
    loadBooks,
    loadAdminBooks,              // 新增
    loadBorrowRecords,
    loadAllBorrowRecords,
    loadViolations,
    addBook,
    updateBook,                  // 全字段更新（新接口）
    updateBookStock,             // 快捷库存（新接口）
    softDeleteBook,              // 下架
    restoreBook,                 // 上架
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