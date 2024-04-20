<script setup>
import Sidebar from '../../components/Sidebar.vue';
import Empty from '../../components/Empty.vue';
import { onMounted, ref, computed } from 'vue';
import Axios from 'axios';
import TokenService from '../../services/TokenService';
import { baseURL, getImage, formatDate, formatDateForPicker, formatDateForRequest } from '../../config';

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

// Confirmation Modal
const showModal = ref(false);
const openModal = (loan) => {
    loanToEdit.value = loan;
    loanToEdit.value.due_date = formatDateForPicker(loan.due_date);
    showModal.value = true;
};

// Disable Approve Button
const isDisabled = computed(() => {
    if (status.value === 'REQUEST') {
        return loanToEdit.value.quantity > loanToEdit.value.inventory.quantity_available ||
            !loanToEdit.value.pickupLocation || loanToEdit.value.quantity <= 0 || !loanToEdit.value.due_date ||
            loanToEdit.value.due_date < new Date().toISOString();
    } else {
        return false;
    }
});

// Approve Loan
const approveAction = () => {
    if (status.value === 'REQUEST') {
        approveLoan();
    } else if (status.value === 'READY') {
        startLoan();
    } else if (status.value === 'ON-GOING') {
        finishLoan();
    }
};

const approveLoan = async () => {
    try {
        await axiosInstance.post(`/loans/${loanToEdit.value.id}/approve`, {
            quantity: loanToEdit.value.quantity,
            due_date: formatDateForRequest(loanToEdit.value.due_date),
            pickup_location: loanToEdit.value.pickupLocation
        }, bearerToken);
        showModal.value = false;
        fetchLoans(status.value);
    } catch (error) {
        console.error('Approval failed', error);
    }
};

const startLoan = async () => {
    try {
        await axiosInstance.post(`/loans/${loanToEdit.value.id}/start`, {}, bearerToken);
        showModal.value = false;
        fetchLoans(status.value);
    } catch (error) {
        console.error('Start loan failed', error);
    }
};

const finishLoan = async () => {
    try {
        await axiosInstance.post(`/loans/${loanToEdit.value.id}/finish`, {}, bearerToken);
        showModal.value = false;
        fetchLoans(status.value);
    } catch (error) {
        console.error('Finish loan failed', error);
    }
};

// List Button Text
const listButtonText = computed(() => {
    return status.value === 'REQUEST' ? 'Approve' :
        status.value === 'READY' ? 'Borrowed' :
            status.value === 'ON-GOING' ? 'Done' : '';
});

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
        </div>

        <!-- Table for displaying loans -->
        <table v-if="loans.length" class="table w-full text-center">
            <thead>
                <tr>
                    <th class="w-1/6">Image</th>
                    <th class="w-1/6">Inventory</th>
                    <th class="w-1/6">Quantity</th>
                    <th class="w-1/6">Due Date</th>
                    <th class="w-1/6">Name</th>
                    <th class="w-1/6">NIS</th>
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
                    <td>{{ formatDate(item.due_date) }}</td>
                    <td>{{ item.user.name }}</td>
                    <td>{{ item.user.role === 'siswa' ? item.user.nis : item.user.nip }}</td>
                    <td>
                        <button class="btn bg-green-500 text-white" @click="openModal(item)">{{ listButtonText
                            }}</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <Empty v-else />

        <!-- Modal for confirmation -->
        <div v-if="showModal" class="modal modal-open">
            <div class="modal-box">
                <button @click="showModal = false" class="mb-4">
                    <span class="material-symbols-outlined">close</span>
                </button>
                <p class="text-sm font-medium text-gray-400">Requested by
                </p>
                <div class="flex items-center gap-1 font-bold text-lg">
                    <h3>{{ loanToEdit.user.name }}</h3>
                    <p class="text-primary font-medium">({{ loanToEdit.user.role == 'siswa' ?
                loanToEdit.user.nis
                :
                loanToEdit.user.nip }})</p>
                </div>
                <hr class="my-4">
                <div class="flex gap-4">
                    <img :src="getImage(loanToEdit.inventory.photo)" alt="Inventory Image"
                        class="h-32 w-32 rounded-md object-cover">
                    <div class="w-full">

                        <h3 class="font-bold text-lg mb-1">{{ loanToEdit.inventory.name }}</h3>
                        <div class="flex gap-2 mr-2">
                            <div>
                                <p class="text-sm font-medium text-gray-400 mb-1">Quantity</p>
                                <input type="text" v-model="loanToEdit.quantity"
                                    class="input input-bordered focus:border-primary focus:ring-primary w-full"
                                    :disabled="status !== 'REQUEST'" />
                            </div>

                            <div>
                                <p class="text-sm font-medium text-gray-400 mb-1">Avilable</p>
                                <input type="text" v-model="loanToEdit.inventory.quantity_available"
                                    class="input input-bordered w-full" disabled />
                            </div>
                        </div>

                        <div v-if="status === 'REQUEST'" class="flex gap-2 mt-2">
                            <div class="w-full">
                                <p class="text-sm font-medium text-gray-400 mb-1">Due Date</p>
                                <input type="datetime-local" v-model="loanToEdit.due_date"
                                    class="input input-bordered focus:border-primary focus:ring-primary w-full" />
                            </div>
                        </div>

                        <div v-if="status === 'REQUEST'" class="mt-2">
                            <p class="text-sm font-medium text-gray-400 mb-1">Pickup Location</p>
                            <select v-model="loanToEdit.pickupLocation" class="select select-bordered w-full">
                                <option disabled value="">Please select a location</option>
                                <option value="Music Room">Music Room</option>
                                <option value="Laboratory">Laboratory</option>
                                <option value="Administrative Room">Administrative Room</option>
                                <option value="Library">Library</option>
                                <option value="Warehouse">Warehouse</option>
                                <option value="Sports Room">Sports Room</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-action">
                    <button class="btn bg-primary text-white w-full" @click="approveAction" :disabled="isDisabled">{{
                        listButtonText }}</button>
                </div>
            </div>
        </div>
    </div>
</template>