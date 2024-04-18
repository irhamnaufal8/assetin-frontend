<script setup>
import Sidebar from '../../components/Sidebar.vue';
import { onMounted, ref, computed } from 'vue';
import Axios from 'axios';
import TokenService from '../../services/TokenService';
import { baseURL, getImage } from '../../config';

// Setup Axios
const axiosInstance = Axios.create({
    baseURL: baseURL
});

const bearerToken = {
    headers: { Authorization: `Bearer ${TokenService.getToken()}` }
};

// Inventories Data
const inventories = ref([]);
const category = ref(null);
const inventoryToEdit = ref(null);

const fetchInventories = async (input) => {
    category.value = input;
    try {
        const response = await axiosInstance.get('/inventories', {
            params: {
                category_id: category.value
            },
            headers: bearerToken.headers
        });
        inventories.value = response.data;
    } catch (error) {
        console.error('Fetch inventories failed', error);
    }
};

// Detail Modal
const modal = ref({
    show: false,
    type: 'add'
});
const openModal = (type, inventory) => {
    inventoryToEdit.value = inventory;
    modal.value = {
        show: true,
        type: type
    };
};

// Disable Main Button
const isDisabled = computed(() => {
    return !inventoryToEdit.value.name || !inventoryToEdit.value.category_id || !inventoryToEdit.value.quantity_available || !inventoryToEdit.value.photo;
});

onMounted(() => {
    fetchInventories();
});
</script>

<template>
    <Sidebar />
    <div class="relative pl-[403px] pr-[40px] pb-[18px]">
        <!-- Header -->
        <div class="fixed z-40 right-0 left-0 pl-[403px] pr-[40px] pt-4 bg-white">
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold">Inventories</h1>
                <button class="btn bg-primary rounded-full text-white" @click="openModal('add', {})">
                    <span class="material-symbols-outlined">add</span> Add Inventory
                </button>
            </div>
            <hr class="mt-4">
        </div>

        <!-- Chips for filtering -->
        <div class="flex space-x-3 mb-4 pt-[100px]">
            <button class="btn" :class="!category ? 'bg-primary text-white' : ''"
                @click="fetchInventories(null)">All</button>
            <button class="btn" :class="category === 1 ? 'bg-primary text-white' : ''"
                @click="fetchInventories(1)">Furniture</button>
            <button class="btn" :class="category === 2 ? 'bg-primary text-white' : ''"
                @click="fetchInventories(2)">Music</button>
            <button class="btn" :class="category === 3 ? 'bg-primary text-white' : ''"
                @click="fetchInventories(3)">Classroom</button>
            <button class="btn" :class="category === 4 ? 'bg-primary text-white' : ''"
                @click="fetchInventories(4)">Laboratory</button>
            <button class="btn" :class="category === 5 ? 'bg-primary text-white' : ''"
                @click="fetchInventories(5)">Sports</button>
            <button class="btn" :class="category === 6 ? 'bg-primary text-white' : ''"
                @click="fetchInventories(6)">Library</button>
        </div>

        <!-- Table for displaying inventories -->
        <table v-if="inventories.length" class="table w-full text-center">
            <thead>
                <tr>
                    <th class="w-1/6">Image</th>
                    <th class="w-1/3">Inventory</th>
                    <th class="w-1/6">Category</th>
                    <th class="w-1/6">Quantity</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in inventories" :key="item.id">
                    <td class="flex justify-center">
                        <img :src="getImage(item.photo)" alt="Inventory Image"
                            class="h-20 w-20 rounded-full object-cover">
                    </td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.category.name }}</td>
                    <td>{{ item.quantity_available }}</td>
                    <td>
                        <div class="flex gap-2">
                            <button class="btn" @click="openModal('edit', item)">Edit</button>
                            <button class="btn bg-red-100 text-red-500"
                                @click="openModal('delete', item)">Delete</button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-else class="text-center mt-8">There's no data here.</p>

        <!-- Modal for edit inventory -->
        <div v-if="modal.show && modal.type !== 'delete'" class="modal modal-open">
            <div class="modal-box">
                <button @click="modal = false" class="mb-4">
                    <span class="material-symbols-outlined">close</span>
                </button>

                <div class="flex items-center gap-3">
                    <img :src="inventoryToEdit.photo ? getImage(inventoryToEdit.photo) : 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg'"
                        class="w-40 h-40 object-cover rounded-lg">
                    <div class="w-full">
                        <div>
                            <p class="text-sm font-medium text-gray-400 mb-1">Inventory Name</p>
                            <input type="text" v-model="inventoryToEdit.name" placeholder="Pencil.."
                                class="input input-bordered focus:border-primary focus:ring-primary w-full" />
                        </div>

                        <div class="my-3">
                            <p class="text-sm font-medium text-gray-400 mb-1">Category</p>
                            <select v-model="inventoryToEdit.category_id" class="select select-bordered w-full">
                                <option disabled value="">Please select a category</option>
                                <option value=1>Furniture</option>
                                <option value=2>Music</option>
                                <option value=3>Classroom</option>
                                <option value=4>Laboratory</option>
                                <option value=5>Sports</option>
                                <option value=6>Library</option>
                            </select>
                        </div>

                        <div>
                            <p class="text-sm font-medium text-gray-400 mb-1">Available Quantity</p>
                            <input type="text" v-model="inventoryToEdit.quantity_available" placeholder="20"
                                class="input input-bordered focus:border-primary focus:ring-primary w-full" />
                        </div>
                    </div>
                </div>

                <div class="modal-action">
                    <button class="btn bg-primary text-white w-full" @click="modal.show = false"
                        :disabled="isDisabled">{{
                    modal.type === 'add' ? 'Create Inventory' : 'Edit Inventory' }}</button>
                </div>
            </div>
        </div>
    </div>
</template>