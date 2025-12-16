<template>
  <div class="book-stats-page">
    <h2 class="page-title">书籍借阅统计</h2>

    <div class="stats-overview">
      <div class="stat-card">
        <h3>总书籍数</h3>
        <p class="stat-value">{{ stats.totalBooks }}</p>
      </div>
      <div class="stat-card">
        <h3>总借阅次数</h3>
        <p class="stat-value">{{ stats.totalBorrows }}</p>
      </div>
    </div>

    <div class="stats-container">
      <div class="chart-wrapper">
        <h3>书籍借阅次数排行</h3>
        <canvas id="borrowCountChart"></canvas>
      </div>

      <div class="chart-wrapper">
        <h3>分类借阅次数统计</h3>
        <canvas id="categoryChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useBookStore } from '../store/bookStore';
import { useUserStore } from '../store/userStore';
import { useRouter } from 'vue-router';
import Chart from 'chart.js/auto';

const bookStore = useBookStore();
const userStore = useUserStore();
const router = useRouter();
const stats = ref({});

onMounted(() => {
  // 权限校验
  if (!userStore.currentUser || userStore.currentUser.role !== 'admin') {
    alert('权限不足，只有管理员可以访问此页面');
    router.push('/home');
    return;
  }

  stats.value = bookStore.getBorrowStats();

  initBorrowCountChart();
  initCategoryChart();
});

// 书籍借阅次数图表
const initBorrowCountChart = () => {
  const ctx = document.getElementById('borrowCountChart').getContext('2d');

  const labels = stats.value.bookStats.map(item => item.name);
  const data = stats.value.bookStats.map(item => item.count);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '借阅次数',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
};

// 分类统计图表
const initCategoryChart = () => {
  const ctx = document.getElementById('categoryChart').getContext('2d');

  const labels = Object.keys(stats.value.categoryStats);
  const data = Object.values(stats.value.categoryStats);

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true
    }
  });
};
</script>

<style scoped>
.book-stats-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.page-title {
  margin-bottom: 30px;
  color: #333;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}

.stats-overview {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  flex: 1;
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin: 10px 0 0;
}

.stats-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.chart-wrapper {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
}

.chart-wrapper h3 {
  margin-bottom: 20px;
  color: #409eff;
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
  .stats-overview {
    flex-direction: column;
  }
}
</style>