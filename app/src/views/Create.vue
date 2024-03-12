<script setup>
import Axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { baseURL } from '/src/config';


const books = ref([]);
const router = useRouter();

const storeData = async () => {
  await Axios.request(`${baseURL}/books`, {
    method: 'post',
    data: {
      title: document.getElementById('title').value,
      author: document.getElementById('author').value
    }
  }).then(() => {
    router.push('/');
  }).catch((error) => {
    console.log(error);
  });
}

</script>

<template>
  <div>
    <h1 class="text-center text-4xl font-bold mt-4">Create Books</h1>
    <form @submit.prevent="storeData" method="post" class="flex flex-col justify-center gap-4 p-10">
      <input type="text" name="title" class="border p-2 rounded" id="title" placeholder="Masukkan judul buku">
      <input type="text" name="author" id="author" class="border p-2 rounded" placeholder="Masukkan penulis buku">
      <button class="bg-blue-400 to-white rounded w-fit p-2">Simpan</button>
    </form>
  </div>
</template>