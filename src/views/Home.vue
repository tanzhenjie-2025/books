<template>
  <div class="home-page">
    <h2 class="page-title">图书列表</h2>
    <div class="book-list">
      <BookItem
        v-for="book in bookStore.books"
        :key="book.id"
        :book="book"
        @borrow="handleBorrow(book.id)"
      />
    </div>
  </div>
</template>

<script setup>
import {useBookStore} from '../store/bookStore';
import {useUserStore} from '../store/userStore';
import BookItem from '../components/BookItem.vue';

const bookStore = useBookStore();
const userStore = useUserStore();

// 借阅书籍
const handleBorrow = (bookId) => {
  const {success, message} = bookStore.borrowBook(userStore.currentUser.id, bookId);
  alert(message);
};
</script>

<style scoped>
.home-page {
  background: #ffffff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 25px;
  color: #1f2937;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
  font-size: 20px;
}

.book-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

@media (max-width: 768px) {
  .home-page {
    padding: 20px;
  }
}
</style>