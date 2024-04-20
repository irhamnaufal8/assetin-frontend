<script setup>
import Sidebar from '../../components/Sidebar.vue';
import Empty from '../../components/Empty.vue';
import { onMounted, ref, computed } from 'vue';
import Axios from 'axios';
import TokenService from '../../services/TokenService';
import { baseURL, getImage, formatDate } from '../../config';

// Setup Axios
const axiosInstance = Axios.create({
    baseURL: baseURL
});

const bearerToken = {
    headers: { Authorization: `Bearer ${TokenService.getToken()}` }
};

// Loans Data
const loans = ref([]);
const status = ref(null);
const loanToEdit = ref(null);

const fetchLoans = async (input) => {
    status.value = input;
    try {
        const response = await axiosInstance.get('/loans/user', {
            params: {
                status: status.value
            },
            headers: bearerToken.headers
        });
        loans.value = response.data;
    } catch (error) {
        console.error('Fetch loans failed', error);
    }
};

onMounted(() => {
    fetchLoans('REQUEST');
});

</script>

<template>
    <Sidebar />
    <div class="relative pl-[403px] pr-[40px] pb-[18px]">
        <!-- Header -->
        <div class="fixed z-40 right-0 left-0 pl-[403px] pr-[40px] pt-4 bg-white">
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold">Loans</h1>
                <img src="/assets/logo.svg" alt="Logo" class="h-[40px]">
            </div>
            <hr class="mt-4">
        </div>

        <!-- Chips for filtering -->
        <div class="flex space-x-3 mb-4 pt-[100px]">
            <button class="btn rounded-full" :class="status === 'REQUEST' ? 'bg-orange-100 border border-primary' : ''"
                @click="fetchLoans('REQUEST')">Requested</button>
            <button class="btn rounded-full" :class="status === 'READY' ? 'bg-orange-100 border border-primary' : ''"
                @click="fetchLoans('READY')">Ready</button>
            <button class="btn rounded-full" :class="status === 'ON-GOING' ? 'bg-orange-100 border border-primary' : ''"
                @click="fetchLoans('ON-GOING')">On Going</button>
            <button class="btn rounded-full" :class="status === 'DONE' ? 'bg-orange-100 border border-primary' : ''"
                @click="fetchLoans('DONE')">Done</button>
        </div>

        <!-- Table for displaying loans -->
        <table v-if="loans.length" class="table w-full text-center">
            <thead>
                <tr>
                    <th class="w-1/6">Image</th>
                    <th class="w-1/6">Inventory</th>
                    <th class="w-1/6">Quantity</th>
                    <th class="w-1/6">Pickup Location</th>
                    <th class="w-1/6">Last Update</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in loans" :key="item.id">
                    <td class="flex justify-center">
                        <img :src="getImage(item.inventory.photo)" alt="Inventory Image"
                            class="h-20 w-20 rounded-md object-cover">
                    </td>
                    <td>{{ item.inventory.name }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ item.pickup_location || '-' }}</td>
                    <td>{{ formatDate(item.updated_at) }}</td>
                </tr>
            </tbody>
        </table>
        <Empty v-else />
    </div>
</template>