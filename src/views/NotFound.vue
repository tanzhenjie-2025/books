<template>
  <div class="not-found-page">
    <h2>404 - 页面不存在</h2>
    <p>您访问的页面不存在，请返回首页</p>
    <button class="btn btn-primary" @click="goHome">返回首页</button>
  </div>
</template>

<script setup>
/**
 * 404页面：处理未定义路由访问
 * 课程设计注释：友好提示用户，提供返回首页按钮
 */
import { useRouter } from 'vue-router';

const router = useRouter();

/**
 * 返回首页
 */
const goHome = () => {
  router.push('/home');
};
</script>

<style scoped>
.not-found-page {
  text-align: center;
  padding: 100px 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin: 50px auto;
  max-width: 600px;
}

.not-found-page h2 {
  font-size: 60px;
  color: #f56c6c;
  margin-bottom: 20px;
}

.not-found-page p {
  font-size: 20px;
  color: #666;
  margin-bottom: 30px;
}
</style>