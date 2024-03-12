<script setup>
import Axios from 'axios';
import { ref, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

const books = ref([]);
const router = useRouter();



onMounted(() => {
  Axios.get('http://127.0.0.1:8000/api/books')
    .then((response) => {
      books.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
});
</script>

<template>
  <div>
    <h1 class="text-center text-4xl font-bold mt-4">Hello API</h1>
    <div v-for="book in books" :key="book.id">
      <h2 class="text-2xl font-bold">{{ book.title }}</h2>
      <p class="text-lg">{{ book.author }}</p>
    </div>
    <RouterLink to="/create">Create Book</RouterLink>
  </div>
</template>