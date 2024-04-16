<script setup>
import { onMounted, ref } from 'vue';
import Axios from 'axios';
import TokenService from '../services/TokenService';
import { baseURL } from '../config';
import Sidebar from '../components/Sidebar.vue';

// Setup Axios
const axiosInstance = Axios.create({
    baseURL: baseURL
});

const bearerToken = {
    headers: { Authorization: `Bearer ${TokenService.getToken()}` }
};

// Get User
const user = ref({});
const fetchUser = async () => {
    try {
        const response = await axiosInstance.get('/users/me', bearerToken);
        user.value = response.data;
    } catch (error) {
        console.error('Fetch user failed', error);
    }
};

onMounted(() => {
    fetchUser();
});

const showModal = ref(false);

</script>

<template>
    <Sidebar />
    <div class="relative pl-[403px] pr-[40px] pb-[18px]">
        <div class="fixed z-40 right-0 left-0 pl-[403px] pr-[40px] pt-4 bg-white">
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold">Profile</h1>
                <img src="/assets/logo.svg" alt="Logo" class="h-[40px]">
            </div>
            <hr class="mt-4">
        </div>
    </div>
</template>