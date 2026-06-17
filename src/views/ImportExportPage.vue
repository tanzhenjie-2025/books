<template>
  <div class="import-export-container">
    <!-- 导出区域 -->
    <section class="card">
      <h2>导出图书信息</h2>
      <p>点击下方按钮将当前所有图书信息导出为 Excel 文件（.xlsx），文件名包含导出时间。</p>
      <button class="primary-btn" @click="handleExport" :disabled="exportLoading">
        {{ exportLoading ? '导出中...' : '导出图书信息' }}
      </button>
    </section>

    <!-- 导入区域 -->
    <section class="card">
      <h2>导入图书信息</h2>
      <p>请先导出当前图书作为模板，按相同格式填写 Excel 文件后导入。支持两种模式：</p>
      <ul>
        <li><strong>覆盖导入</strong>：用Excel数据覆盖已有书籍的基础信息（不影响其他书籍）。</li>
        <li><strong>添加导入</strong>：已有书籍仅累加库存，新书籍直接添加。</li>
      </ul>

      <div class="upload-area">
        <input
          type="file"
          ref="fileInput"
          accept=".xlsx,.xls"
          @change="handleFileChange"
          class="file-input"
        />
        <span class="file-name" v-if="selectedFile">{{ selectedFile.name }}</span>
      </div>

      <div class="import-actions">
        <button
          class="warning-btn"
          @click="handleImport('overwrite')"
          :disabled="!selectedFile || importLoading === 'overwrite'"
        >
          {{ importLoading === 'overwrite' ? '导入中...' : '覆盖导入' }}
        </button>
        <button
          class="success-btn"
          @click="handleImport('append')"
          :disabled="!selectedFile || importLoading === 'append'"
        >
          {{ importLoading === 'append' ? '导入中...' : '添加导入' }}
        </button>
      </div>

      <p class="message" v-if="importMessage">{{ importMessage }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const exportLoading = ref(false);
const importLoading = ref(null); // 'overwrite' or 'append'
const selectedFile = ref(null);
const importMessage = ref('');
const fileInput = ref(null);

// 导出功能
const handleExport = async () => {
  exportLoading.value = true;
  try {
    const response = await axios.get('/api/books/export', {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    const disposition = response.headers['content-disposition'];
    let filename = '图书信息.xlsx';
    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";\s]+)/);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]);
      }
    }

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
    exportLoading.value = false;
  }
};

// 选择文件
const handleFileChange = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    selectedFile.value = files[0];
    importMessage.value = '';
  } else {
    selectedFile.value = null;
  }
};

// 导入处理
const handleImport = async (mode) => {
  if (!selectedFile.value) {
    alert('请先选择Excel文件');
    return;
  }

  const url = mode === 'overwrite' ? '/api/books/import/overwrite' : '/api/books/import/append';
  const formData = new FormData();
  formData.append('file', selectedFile.value);

  importLoading.value = mode;
  importMessage.value = '';
  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    importMessage.value = response.data;
    alert(response.data);
    // 清空选择
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
  } catch (error) {
    const msg = error.response?.data || '导入失败';
    importMessage.value = msg;
    alert(msg);
  } finally {
    importLoading.value = null;
  }
};
</script>

<style scoped>
.import-export-container {
  max-width: 800px;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.card {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
h2 {
  color: #409eff;
  margin-bottom: 12px;
}
p {
  color: #666;
  margin-bottom: 16px;
}
ul {
  margin: 8px 0 16px 20px;
  color: #555;
}
li {
  margin-bottom: 4px;
}
.upload-area {
  margin: 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}
.file-name {
  color: #333;
}
.import-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
.message {
  margin-top: 12px;
  color: #67c23a;
  font-weight: bold;
}

/* 原生按钮样式 */
.primary-btn {
  padding: 10px 20px;
  background-color: #409eff;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}
.primary-btn:hover { background-color: #337ecc; }
.primary-btn:disabled { background-color: #a0cfff; cursor: not-allowed; }

.warning-btn {
  padding: 10px 20px;
  background-color: #e6a23c;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}
.warning-btn:hover { background-color: #cf9236; }
.warning-btn:disabled { background-color: #f3d19e; cursor: not-allowed; }

.success-btn {
  padding: 10px 20px;
  background-color: #67c23a;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}
.success-btn:hover { background-color: #5daf34; }
.success-btn:disabled { background-color: #b3e19d; cursor: not-allowed; }
</style>