<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Axios from 'axios';
import TokenService from '../../services/TokenService';
import { baseURL, getImage, studentFormatDate } from '../../config';
import { RouterLink } from 'vue-router';
import Sidebar from '../../components/Sidebar.vue';

const router = useRouter();
const showLogoutModal = ref(false);

// Setup instance Axios
const axiosInstance = Axios.create({
    baseURL: baseURL
});

const bearerToken = {
    headers: { Authorization: `Bearer ${TokenService.getToken()}` }
};

// User Loans
const loans = ref([]);

const fetchLoans = async () => {
    try {
        const response = await axiosInstance.get('/home-loans', bearerToken);
        loans.value = response.data;
    } catch (error) {
        console.error('Fetch loans failed', error)
    }
}

onMounted(() => {
    fetchLoans();
});

</script>

<template>
    <Sidebar />
    <div class="relative pl-[403px] pr-[40px] pb-[18px]">
        <!-- Header -->
        <div class="fixed z-40 right-0 left-0 pl-[403px] pr-[40px] pt-4 bg-white">
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold">Home</h1>
                <img src="/assets/logo.svg" alt="Logo" class="h-[40px]">
            </div>
            <hr class="mt-4">
        </div>

        <div class="pt-[100px]"></div>

        <!-- User Loan Request -->
        <div v-if="loans.length">
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-2xl font-bold">Your requests</h1>
                <RouterLink to="/history"
                    class="flex items-center font-semibold text-primary hover:text-gray-500 transition-colors">
                    See All
                    <span class="material-symbols-outlined">chevron_right</span>
                </RouterLink>
            </div>

            <!-- Loan Card -->
            <div class="flex max-[1100px]:flex-col items-center gap-2">
                <div v-for="item in loans.slice(0, 2)" :key="item.id"
                    class="w-full h-[142px] gap-4 p-4 border border-gray-200 rounded-xl">
                    <div class="flex items-start">
                        <img :src="getImage(item.inventory.photo)" alt="Loan Image"
                            class="w-28 h-28 rounded-md object-cover">

                        <div v-if="item.status === 'READY'" class="flex flex-col w-full">
                            <p
                                class="text-xs font-semibold text-white rounded-full p-1 bg-green-500 mb-1 text-center w-24">
                                {{ item.status }}
                            </p>
                            <p class="text-lg font-bold text-gray-700">{{ item.inventory.name }}</p>
                            <p class="text-sm font-semibold text-gray-500">Take it at {{ item.pickup_location }}</p>
                            <p class="text-sm font-semibold text-primary mt-1">Deadline: {{
            studentFormatDate(item.due_date) }}
                            </p>
                        </div>
                        <div v-else class="flex flex-col w-full">
                            <p
                                class="text-xs font-semibold text-white rounded-full p-1 bg-primary mb-1 text-center w-24">
                                {{ item.status }}
                            </p>
                            <p class="text-lg font-bold text-gray-700">{{ item.inventory.name }}</p>
                            <p class="text-sm font-semibold text-gray-500">Still processing..</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Inventory Category -->
        <div class="mt-8">
            <h1 class="text-2xl font-bold mb-4">Need something?</h1>

            <!-- Grid: Inventory -->
            <div class="container">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    <RouterLink to="/inventory/1" class="relative">
                        <img src="/assets/furniture.png" alt="Furniture Inventory"
                            class="object-cover w-full h-[108px] rounded-lg">
                        <div
                            class="absolute inset-0 bg-black bg-opacity-45 hover:bg-opacity-60 transition-all flex items-center justify-center text-white font-semibold hover:text-lg rounded-lg">
                            Furniture
                        </div>
                    </RouterLink>

                    <RouterLink to="/inventory/2" class="relative">
                        <img src="/assets/music.png" alt="Music Inventory"
                            class="object-cover w-full h-[108px] rounded-lg">
                        <div
                            class="absolute inset-0 bg-black bg-opacity-45 hover:bg-opacity-60 transition-all flex items-center justify-center text-white font-semibold hover:text-lg rounded-lg">
                            Music
                        </div>
                    </RouterLink>

                    <RouterLink to="/inventory/3" class="relative">
                        <img src="/assets/classroom.png" alt="Classroom Inventory"
                            class="object-cover w-full h-[108px] rounded-lg">
                        <div
                            class="absolute inset-0 bg-black bg-opacity-45 hover:bg-opacity-60 transition-all flex items-center justify-center text-white font-semibold hover:text-lg rounded-lg">
                            Classroom
                        </div>
                    </RouterLink>

                    <RouterLink to="/inventory/4" class="relative">
                        <img src="/assets/laboratory.png" alt="Laboratory Inventory"
                            class="object-cover w-full h-[108px] rounded-lg">
                        <div
                            class="absolute inset-0 bg-black bg-opacity-45 hover:bg-opacity-60 transition-all flex items-center justify-center text-white font-semibold hover:text-lg rounded-lg">
                            Laboratory
                        </div>
                    </RouterLink>

                    <RouterLink to="/inventory/5" class="relative">
                        <img src="/assets/sports.png" alt="Sports Inventory"
                            class="object-cover w-full h-[108px] rounded-lg">
                        <div
                            class="absolute inset-0 bg-black bg-opacity-45 hover:bg-opacity-60 transition-all flex items-center justify-center text-white font-semibold hover:text-lg rounded-lg">
                            Sports
                        </div>
                    </RouterLink>

                    <RouterLink to="/inventory/6" class="relative">
                        <img src="/assets/library.png" alt="Library Inventory"
                            class="object-cover w-full h-[108px] rounded-lg">
                        <div
                            class="absolute inset-0 bg-black bg-opacity-45 hover:bg-opacity-60 transition-all flex items-center justify-center text-white font-semibold hover:text-lg rounded-lg">
                            Library
                        </div>
                    </RouterLink>
                </div>
            </div>
        </div>

        <hr class="my-8">

        <!-- App Banner -->
        <div class="flex gap-6 items-center w-full bg-secondary rounded-xl">
            <img src="/assets/app-banner.png" alt="App Banner" class="w-1/3 rounded-xl">

            <div>
                <h1 class="text-3xl font-bold text-gray-800">Download our mobile apps</h1>
                <h1 class="text-xl text-gray-500 mb-4">Unlock convenience on-the-go!</h1>

                <div class="flex items-center gap-2 w-1/5">
                    <img src="/assets/playstore.png" alt="Play Store" class="w-full">
                    <img src="/assets/appstore.png" alt="App Store" class="w-full">
                </div>
            </div>
        </div>
    </div>
</template>