<template>
  <div class="export-container">
    <h2>导出图书信息</h2>
    <p>点击下方按钮将当前所有图书信息导出为 Excel 文件（.xlsx），文件名包含导出时间。</p>
    <el-button type="primary" @click="handleExport" :loading="loading">
      <i class="el-icon-download"></i> 导出图书信息
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const loading = ref(false);

const handleExport = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/books/export', {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    // 从响应头获取文件名，如果没有则使用默认名称
    const contentDisposition = response.headers['content-disposition'];
    let filename = '图书信息.xlsx';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^";\s]+)/);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]);
      }
    }

    // 创建下载链接并自动触发下载
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    alert('导出成功！');
  } catch (error) {
    console.error('导出失败：', error);
    alert('导出失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.export-container {
  max-width: 600px;
  margin: 40px auto;
  text-align: center;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background: #fff;
}
.export-container h2 {
  margin-bottom: 16px;
  color: #409eff;
}
.export-container p {
  color: #666;
  margin-bottom: 24px;
}
</style>