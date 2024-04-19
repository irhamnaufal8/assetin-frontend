<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Axios from 'axios';
import TokenService from '../../services/TokenService';
import { baseURL, getImage } from '../../config';
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
                <RouterLink to="/history" class="font-semibold text-primary flex items-center">
                    See All
                    <span class="material-symbols-outlined">chevron_right</span>
                </RouterLink>
            </div>

            <!-- Loan Card -->
            <div class="flex items-center gap-2">
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
                            <p class="text-sm font-semibold text-primary mt-1">Deadline: {{ item.due_date }}</p>
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
    </div>
</template>