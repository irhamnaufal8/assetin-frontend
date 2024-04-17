<script setup>
import Sidebar from '../../components/Sidebar.vue';
import { onMounted, ref } from 'vue';
import Axios, { all } from 'axios';
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
        const response = await axiosInstance.get('/loans', {
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
            <button class="btn" :class="status === 'REQUEST' ? 'bg-primary text-white' : ''"
                @click="fetchLoans('REQUEST')">Requested</button>
            <button class="btn" :class="status === 'READY' ? 'bg-primary text-white' : ''"
                @click="fetchLoans('READY')">Ready</button>
            <button class="btn" :class="status === 'ON-GOING' ? 'bg-primary text-white' : ''"
                @click="fetchLoans('ON-GOING')">On Going</button>
        </div>

        <!-- Table for displaying loans -->
        <table v-if="loans.length" class="table w-full text-center">
            <thead>
                <tr>
                    <th class="w-1/6">Image</th>
                    <th class="w-1/6">Inventory</th>
                    <th class="w-1/6">Quantity</th>
                    <th class="w-1/6">Date</th>
                    <th class="w-1/6">Name</th>
                    <th class="w-1/6">NIS</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in loans" :key="item.id">
                    <td>
                        <img :src="item.inventory.photo" alt="Inventory Image"
                            class="h-20 w-20 rounded-full object-cover">
                    </td>
                    <td>{{ item.inventory.name }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatDate(item.due_date) }}</td>
                    <td>{{ item.user.name }}</td>
                    <td>{{ item.user.role === 'siswa' ? item.user.nis : item.user.nip }}</td>
                    <td>
                        <button class="btn bg-green-500 text-white" @click="openApproveModal(user)">Approve</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-else class="text-center mt-8">There's no data here.</p>
    </div>
</template>