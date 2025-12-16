<template>
  <div class="book-manage">
    <h2>图书管理</h2>
    <!-- 新增图书表单 -->
    <div class="add-form">
      <input v-model="newBook.name" placeholder="图书名称" />
      <input v-model="newBook.author" placeholder="作者" />
      <button @click="addBook">新增图书</button>
    </div>
    <!-- 图书列表 -->
    <table class="book-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>图书名称</th>
          <th>作者</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="book in bookList" :key="book.id">
          <td>{{ book.id }}</td>
          <td>{{ book.name }}</td>
          <td>{{ book.author }}</td>
          <td>
            <button @click="deleteBook(book.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 模拟图书数据
const bookList = ref([
  { id: 1, name: 'Vue.js实战', author: '尤雨溪' },
  { id: 2, name: 'JavaScript高级程序设计', author: '马特·弗里斯比' }
])

// 新增图书的临时数据
const newBook = ref({ name: '', author: '' })

// 新增图书方法
const addBook = () => {
  if (!newBook.value.name || !newBook.value.author) {
    alert('请填写图书名称和作者！')
    return
  }
  bookList.value.push({
    id: bookList.value.length + 1,
    name: newBook.value.name,
    author: newBook.value.author
  })
  // 清空表单
  newBook.value = { name: '', author: '' }
}

// 删除图书方法
const deleteBook = (id) => {
  bookList.value = bookList.value.filter(book => book.id !== id)
}
</script>

<style scoped>
.book-manage {
  max-width: 800px;
  margin: 0 auto;
}
.add-form {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}
.add-form input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}
.add-form button {
  padding: 8px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.book-table {
  width: 100%;
  border-collapse: collapse;
}
.book-table th, .book-table td {
  padding: 12px;
  border: 1px solid #d1d5db;
  text-align: left;
}
.book-table th {
  background: #f3f4f6;
}
.book-table button {
  padding: 4px 8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>