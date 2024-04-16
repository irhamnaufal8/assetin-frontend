<script setup>
import Sidebar from '../../components/Sidebar.vue';
import { onMounted, ref } from 'vue';
import Axios, { all } from 'axios';
import TokenService from '../../services/TokenService';
import { baseURL } from '../../config';

// Setup Axios
const axiosInstance = Axios.create({
    baseURL: baseURL
});

const bearerToken = {
    headers: { Authorization: `Bearer ${TokenService.getToken()}` }
};

// Get pending users
const pendingUsers = ref([]);

const fetchPendingUsers = async (role) => {
    currentTab.value = role;
    try {
        const response = await axiosInstance.get('/users/pending', {
            params: {
                role: currentTab.value != 'all' ? currentTab.value : null
            },
            headers: bearerToken.headers
        });
        pendingUsers.value = response.data;
    } catch (error) {
        console.error('Fetch pending users failed', error);
    }
};

const confirmApproval = async () => {
    try {
        const apiEndpoint = userToApprove.value.role === 'admin' ?
            `${baseURL}/users/${userToApprove.value.id}/approve-admin` :
            `${baseURL}/users/${userToApprove.value.id}/approve-student`;

        await Axios.post(apiEndpoint, {}, bearerToken);
        showModal.value = false;
        fetchPendingUsers();
    } catch (error) {
        console.error('Approval failed', error);
    }
};


const currentTab = ref('all');

const showModal = ref(false);
const userToApprove = ref(null);


const openApproveModal = (user) => {
    userToApprove.value = user;
    showModal.value = true;
};

onMounted(() => {
    fetchPendingUsers('all');
});

</script>

<template>
    <Sidebar />
    <div class="relative pl-[403px] pr-[40px] pb-[18px]">
        <div class="fixed z-40 right-0 left-0 pl-[403px] pr-[40px] pt-4 bg-white">
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold">Pending Users</h1>
                <img src="/assets/logo.svg" alt="Logo" class="h-[40px]">
            </div>
            <hr class="mt-4">
        </div>

        <!-- Chips for filtering -->
        <div v-if="TokenService.isSuperAdmin()" class="flex space-x-3 mb-4 pt-[100px]">
            <button class="btn" :class="currentTab === 'all' ? 'bg-primary text-white' : ''"
                @click="fetchPendingUsers('all')">All</button>
            <button class="btn" :class="currentTab === 'siswa' ? 'bg-primary text-white' : ''"
                @click="fetchPendingUsers('siswa')">Student</button>
            <button class="btn" :class="currentTab === 'admin' ? 'bg-primary text-white' : ''"
                @click="fetchPendingUsers('admin')">Admin</button>
        </div>

        <!-- Table for displaying users -->
        <div :class="TokenService.isAdmin() ? 'pt-[100px]' : ''">
            <table v-if="pendingUsers.length" class="table w-full text-center">
                <thead>
                    <tr>
                        <th class="w-1/3">Name</th>
                        <th class="w-1/6">Email</th>
                        <th class="w-1/6">Role</th>
                        <th class="w-1/6">NIS/NIP</th>
                        <th class="w-1/6">Approve</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in pendingUsers" :key="user.id">
                        <td class="text-left pl-4">{{ user.name }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.role }}</td>
                        <td>{{ user.role === 'siswa' ? user.nis : user.nip }}</td>
                        <td>
                            <button class="btn bg-green-500 text-white" @click="openApproveModal(user)">Approve</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-else class="text-center mt-8">There's no pending user here.</p>
        </div>
    </div>

    <!-- Modal for confirmation -->
    <div v-if="showModal" class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg">Confirm Approval</h3>
            <p class="py-4">Are you sure you want to approve {{ userToApprove.name }}?</p>
            <div class="modal-action">
                <button class="btn" @click="showModal = false">Cancel</button>
                <button class="btn bg-green-500 text-white" @click="confirmApproval">Approve</button>
            </div>
        </div>
    </div>
</template>
