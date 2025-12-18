<template>
  <div class="book-stats-container">
    <!-- 页面标题 -->
    <div class="stats-header">
      <h2>书籍借阅统计管理</h2>
      <el-button type="primary" @click="refreshStats">刷新数据</el-button>
    </div>

    <!-- 加载状态 -->
    <el-skeleton v-if="loading" :rows="10" animated />

    <!-- 核心统计卡片 -->
    <div class="stats-cards" v-else>
      <el-card class="stats-card">
        <div class="card-item">
          <span class="label">总书籍数</span>
          <span class="value">{{ stats.totalBooks }}</span>
        </div>
      </el-card>
      <el-card class="stats-card">
        <div class="card-item">
          <span class="label">总借阅次数</span>
          <span class="value">{{ stats.totalBorrows }}</span>
        </div>
      </el-card>
      <el-card class="stats-card">
        <div class="card-item">
          <span class="label">未归还数</span>
          <span class="value danger">{{ stats.unReturnedCount }}</span>
        </div>
      </el-card>
      <el-card class="stats-card">
        <div class="card-item">
          <span class="label">逾期数</span>
          <span class="value warning">{{ stats.overdueCount }}</span>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 借阅趋势图 -->
      <el-card class="chart-card">
        <template #header>
          <span>月度借阅趋势</span>
        </template>
        <div id="trendChart" class="chart"></div>
      </el-card>

      <!-- 分类借阅统计 -->
      <el-card class="chart-card">
        <template #header>
          <span>分类借阅统计</span>
        </template>
        <div id="categoryChart" class="chart"></div>
      </el-card>
    </div>

    <!-- 书籍借阅排行表格 -->
    <el-card class="table-card">
      <template #header>
        <span>书籍借阅排行</span>
      </template>
      <el-table :data="stats.bookStats" border stripe style="width: 100%">
        <el-table-column prop="id" label="书籍ID" width="80" />
        <el-table-column prop="name" label="书籍名称" min-width="200" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="borrowCount" label="借阅次数" width="100" />
        <el-table-column prop="stock" label="库存数量" width="100" />
        <el-table-column prop="avgScore" label="平均评分" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useBookStore } from '@/store/bookStore';
import { useUserStore } from '@/store/userStore';
import * as echarts from 'echarts'; // 确保已安装：npm install echarts

// 状态定义
const router = useRouter();
const bookStore = useBookStore(); // 组合式store
const userStore = useUserStore();
const loading = ref(false);
const stats = ref({
  totalBooks: 0,
  totalBorrows: 0,
  returnedCount: 0,
  unReturnedCount: 0,
  overdueCount: 0,
  bookStats: [],
  categoryStatsList: [],
  trendStats: []
});

// 初始化图表
const initCharts = () => {
  // 销毁原有图表避免内存泄漏
  const trendChartDom = document.getElementById('trendChart');
  const categoryChartDom = document.getElementById('categoryChart');
  if (!trendChartDom || !categoryChartDom) return;

  const trendChart = echarts.init(trendChartDom);
  const categoryChart = echarts.init(categoryChartDom);

  // 1. 借阅趋势图配置
  trendChart.setOption({
    title: { text: '' },
    xAxis: {
      type: 'category',
      data: stats.value.trendStats.map(item => item.month)
    },
    yAxis: { type: 'value', name: '借阅次数' },
    series: [{
      data: stats.value.trendStats.map(item => item.count),
      type: 'line',
      smooth: true,
      itemStyle: { color: '#409eff' }
    }],
    tooltip: { trigger: 'axis' },
    responsive: true
  });

  // 2. 分类借阅统计图配置
  categoryChart.setOption({
    title: { text: '' },
    tooltip: { trigger: 'item' },
    series: [{
      name: '借阅次数',
      type: 'pie',
      radius: ['40%', '70%'],
      data: stats.value.categoryStatsList,
      label: {
        show: true,
        formatter: '{b}: {c}次 ({d}%)'
      }
    }],
    responsive: true
  });

  // 窗口自适应
  window.addEventListener('resize', () => {
    trendChart.resize();
    categoryChart.resize();
  });
};

// 刷新统计数据
const refreshStats = async () => {
  loading.value = true;
  try {
    // 加载基础数据（管理员权限）
    const bookRes = await bookStore.loadBooks();
    const borrowRes = await bookStore.loadAllBorrowRecords();

    if (bookRes.success && borrowRes.success) {
      // 从组合式store的computed获取统计数据
      stats.value = bookStore.getBorrowStats;
      initCharts(); // 重新渲染图表
      console.log("【统计数据】刷新完成：", stats.value);
    } else {
      alert('数据刷新失败：' + (bookRes.message || borrowRes.message));
    }
  } catch (error) {
    console.error('刷新统计数据异常:', error);
    alert('数据刷新异常：' + error.message);
  } finally {
    loading.value = false;
  }
};

// 页面初始化
onMounted(async () => {
  // 1. 权限校验（强制管理员）
  if (!userStore.currentUser || userStore.currentUser.role !== 'ROLE_ADMIN') {
    alert('仅管理员可查看借阅统计！');
    router.push('/home');
    return;
  }

  // 2. 加载统计数据
  await refreshStats();
});

// 监听store数据变化自动更新统计
watch(
  [() => bookStore.books, () => bookStore.borrowRecords],
  () => {
    stats.value = bookStore.getBorrowStats;
    initCharts();
  },
  { deep: true }
);
</script>

<style scoped>
.book-stats-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stats-card {
  padding: 10px;
}

.card-item {
  text-align: center;
}

.label {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 8px;
}

.value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.danger {
  color: #f56c6c;
}

.warning {
  color: #e6a23c;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart {
  width: 100%;
  height: 350px;
}

.table-card {
  margin-top: 20px;
}
</style>