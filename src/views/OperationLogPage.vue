<template>
  <div class="log-page">
    <h2 class="page-title">操作日志</h2>

    <!-- 搜索区域 -->
    <div class="search-bar">
      <input
        v-model="searchUsername"
        placeholder="输入用户名查询"
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <button class="search-btn" @click="handleSearch">查询</button>
      <button class="reset-btn" @click="resetSearch">显示全部</button>
    </div>

    <!-- 日志表格 -->
    <div class="table-container" v-if="logs.length > 0">
      <table class="log-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>操作人</th>
            <th>操作类型</th>
            <th>描述</th>
            <th>结果</th>
            <th>操作时间</th>
            <th>IP</th>
            <th>耗时(ms)</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="log in logs"
            :key="log.id"
            :class="{ 'failure-row': log.result === 'FAILURE' }"
          >
            <td>{{ log.id }}</td>
            <td>{{ log.username }}</td>
            <td>
              <span class="operation-tag">{{ log.operation }}</span>
            </td>
            <td>{{ log.description }}</td>
            <td>
              <span :class="log.result === 'SUCCESS' ? 'success-text' : 'failure-text'">
                {{ log.result === 'SUCCESS' ? '成功' : '失败' }}
              </span>
            </td>
            <td>{{ formatTime(log.operateTime) }}</td>
            <td>{{ log.ip }}</td>
            <td>{{ log.duration }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空状态 -->
    <div class="empty-tip" v-else>
      暂无操作日志
    </div>

    <!-- 分页（简单示例） -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        上一页
      </button>
      <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import request from '@/utils/request';

const logs = ref([]);
const searchUsername = ref('');

// 简易分页
const pageSize = 15;
const currentPage = ref(1);
const totalPages = computed(() => Math.ceil(logs.value.length / pageSize));

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return logs.value.slice(start, start + pageSize);
});

// 格式化时间
const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
};

// 加载全部日志
const loadAllLogs = async () => {
  try {
    const res = await request.get('/logs', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    logs.value = res || [];
    currentPage.value = 1;
  } catch (e) {
    alert('加载日志失败');
  }
};

// 按用户名查询
const loadUserLogs = async (username) => {
  try {
    const res = await request.get(`/logs/user/${username}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    logs.value = res || [];
    currentPage.value = 1;
  } catch (e) {
    alert('查询失败');
  }
};

const handleSearch = () => {
  const username = searchUsername.value.trim();
  if (username) {
    loadUserLogs(username);
  } else {
    loadAllLogs();
  }
};

const resetSearch = () => {
  searchUsername.value = '';
  loadAllLogs();
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

onMounted(() => {
  loadAllLogs();
});
</script>

<style scoped>
.log-page {
  background: #ffffff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  max-width: 1300px;
  margin: 20px auto;
}

.page-title {
  margin-bottom: 25px;
  color: #1f2937;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
  font-size: 20px;
}

/* 搜索区域 */
.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  width: 220px;
  font-size: 14px;
  outline: none;
}
.search-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.search-btn, .reset-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  color: white;
}
.search-btn { background: #409eff; }
.reset-btn { background: #6b7280; }
.search-btn:hover { background: #337ecc; }
.reset-btn:hover { background: #4b5563; }

/* 表格 */
.table-container {
  overflow-x: auto;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.log-table thead {
  background-color: #f9fafb;
}

.log-table th,
.log-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e4e7ed;
  font-size: 14px;
}

.log-table th {
  font-weight: 600;
  color: #1f2937;
}

.log-table td {
  color: #4b5563;
}

/* 失败行高亮 */
.failure-row {
  background-color: #fef2f2;
}

.operation-tag {
  background: #e6f7ff;
  color: #007acc;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.success-text {
  color: #16a34a;
  font-weight: 500;
}

.failure-text {
  color: #dc2626;
  font-weight: 500;
}

.empty-tip {
  text-align: center;
  padding: 50px;
  font-size: 16px;
  color: #9ca3af;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #e4e7ed;
  margin-top: 20px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.pagination button {
  padding: 6px 14px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}
.pagination button:hover:not(:disabled) {
  background: #409eff;
  color: white;
  border-color: #409eff;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 768px) {
  .log-page { padding: 20px; }
  .log-table th, .log-table td { padding: 8px; font-size: 12px; }
  .search-bar { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
}
</style>