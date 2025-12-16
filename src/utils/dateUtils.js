/**
 * 日期工具类：计算借阅超时时长、判断是否超时
 * 课程设计注释：封装时间相关逻辑，提高代码复用性
 */

/**
 * 判断借阅是否超时（超过7天）
 * @param {String} borrowTime 借阅时间（格式：YYYY-MM-DD）
 * @returns {Boolean} true=超时，false=未超时
 */
export const isOverdue = (borrowTime) => {
  const borrowDate = new Date(borrowTime);
  const nowDate = new Date();
  // 计算差值（毫秒）→ 转换为天数
  const diffTime = nowDate - borrowDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  // 超过7天即为超时
  return diffDays > 7;
};

/**
 * 计算借阅超时时长（仅当超时返回，否则返回0）
 * @param {String} borrowTime 借阅时间（格式：YYYY-MM-DD）
 * @returns {Number} 超时时长（天）
 */
export const calcOverdueDays = (borrowTime) => {
  if (!isOverdue(borrowTime)) return 0;
  const borrowDate = new Date(borrowTime);
  const nowDate = new Date();
  const diffTime = nowDate - borrowDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  // 超时天数 = 总天数 - 7天
  return diffDays - 7;
};

/**
 * 格式化日期为YYYY-MM-DD
 * @param {Date} date 日期对象
 * @returns {String} 格式化后的日期
 */
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 计算逾期罚款金额
 * @param {Number} overdueDays 逾期天数
 * @param {Number} rate 每天罚款费率，默认0.5元/天
 * @returns {Number} 罚款金额
 */
export const calculatePenalty = (overdueDays, rate = 0.5) => {
  return Math.max(0, overdueDays * rate);
};