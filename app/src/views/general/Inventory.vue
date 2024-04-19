<script setup>
import Sidebar from '../../components/Sidebar.vue';
import { onMounted, ref, computed } from 'vue';
import Axios from 'axios';
import TokenService from '../../services/TokenService';
import { baseURL, getImage, formatDateForRequest } from '../../config';
import { useRoute } from 'vue-router';

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

// File Input
const previewImage = ref(null);
const fileInput = ref(null);
const hover = ref(false);

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

// Update Inventory Main Action
const updateAction = () => {
    if (previewImage.value) {
        uploadPhoto(fileInput.value.files[0]);
    } else {
        updateInventory('NO_IMAGE');
    }
};

// Upload Photo
const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    try {
        const response = await axiosInstance.post('/photos', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${TokenService.getToken()}`
            }
        });
        updateInventory(response.data.path);
    } catch (error) {
        console.error('Upload photo failed', error);
    }
};

// Update Inventory
const updateInventory = async (image) => {
    if (image !== 'NO_IMAGE') inventoryToEdit.value.photo = image;
    const body = {
        name: inventoryToEdit.value.name,
        category_id: inventoryToEdit.value.category_id,
        quantity_available: inventoryToEdit.value.quantity_available,
        photo: inventoryToEdit.value.photo
    };
    try {
        if (modal.value.type === 'add') {
            await axiosInstance.post('/inventories', body, bearerToken);
        } else if (modal.value.type === 'edit') {
            await axiosInstance.put(`/inventories/${inventoryToEdit.value.id}`, body, bearerToken);
        }
        fetchInventories(category.value);
        modal.value.show = false;
    } catch (error) {
        console.error('Update inventory failed', error);
    }
}

// Delete Inventory
const deleteAction = async () => {
    try {
        await axiosInstance.delete(`/inventories/${inventoryToEdit.value.id}`, bearerToken);
        fetchInventories(category.value);
        modal.value.show = false;
    } catch (error) {
        console.error('Delete inventory failed', error);
    }
};

// Borrow Inventory
const borrowAction = async () => {
    try {
        const response = await axiosInstance.get('/users/me', bearerToken);
        borrowInventory(response.data.id);
    } catch (error) {
        console.error('Fetch user failed', error);
    }
};
const borrowInventory = async (userId) => {
    try {
        const body = {
            inventory_id: inventoryToEdit.value.id,
            user_id: userId,
            quantity: inventoryToEdit.value.quantity_available,
            status: "REQUEST",
            due_date: formatDateForRequest(inventoryToEdit.value.date)
        }
        await axiosInstance.post(`/loans`, body, bearerToken)
        fetchInventories(category.value);
        modal.value.show = false;
    } catch (error) {
        console.error('Borrow inventory failed', error)
    }
}

// Detail Modal
const modal = ref({
    show: false,
    type: 'add'
});
const openModal = (type, inventory) => {
    previewImage.value = null;
    inventoryToEdit.value = inventory;
    modal.value = {
        show: true,
        type: type
    };
};

// Disable Main Button
const isDisabled = computed(() => {
    return !inventoryToEdit.value.name || !inventoryToEdit.value.category_id || !inventoryToEdit.value.quantity_available || (!inventoryToEdit.value.photo && !previewImage.value);
});

const disableStudent = computed(() => {
    return !inventoryToEdit.value.quantity_available || !inventoryToEdit.value.date || inventoryToEdit.value.date < new Date().toISOString();;
});

// Route
const route = useRoute();

onMounted(() => {
    const categoryId = parseInt(route.params.categoryId, 10);
    if (!isNaN(categoryId)) {
        category.value = categoryId;
    }
    fetchInventories(category.value);
});
</script>

<template>
    <Sidebar />
    <div class="relative pl-[403px] pr-[40px] pb-[18px]">
        <!-- Header -->
        <div class="fixed z-40 right-0 left-0 pl-[403px] pr-[40px] pt-4 bg-white">
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold">Inventories</h1>
                <button v-show="!TokenService.isStudent()" class="btn bg-primary rounded-full text-white"
                    @click="openModal('add', {})">
                    <span class="material-symbols-outlined">add</span> Add Inventory
                </button>
                <img v-show="TokenService.isStudent()" src="/assets/logo.svg" alt="Logo" class="h-[40px]">
            </div>
            <hr class="mt-4">
        </div>

        <!-- Chips for filtering -->
        <div class="flex space-x-3 mb-4 pt-[100px]">
            <button class="btn rounded-full" :class="!category ? 'bg-orange-100 border border-primary' : ''"
                @click="fetchInventories(null)">All</button>
            <button class="btn rounded-full" :class="category === 1 ? 'bg-orange-100 border border-primary' : ''"
                @click="fetchInventories(1)">Furniture</button>
            <button class="btn rounded-full" :class="category === 2 ? 'bg-orange-100 border border-primary' : ''"
                @click="fetchInventories(2)">Music</button>
            <button class="btn rounded-full" :class="category === 3 ? 'bg-orange-100 border border-primary' : ''"
                @click="fetchInventories(3)">Classroom</button>
            <button class="btn rounded-full" :class="category === 4 ? 'bg-orange-100 border border-primary' : ''"
                @click="fetchInventories(4)">Laboratory</button>
            <button class="btn rounded-full" :class="category === 5 ? 'bg-orange-100 border border-primary' : ''"
                @click="fetchInventories(5)">Sports</button>
            <button class="btn rounded-full" :class="category === 6 ? 'bg-orange-100 border border-primary' : ''"
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
                            class="h-20 w-20 rounded-md object-cover">
                    </td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.category.name }}</td>
                    <td>{{ item.quantity_available }}</td>
                    <td>
                        <div v-show="!TokenService.isStudent()" class="flex gap-2">
                            <button class="btn" @click="openModal('edit', item)">Edit</button>
                            <button class="btn bg-red-100 text-red-500"
                                @click="openModal('delete', item)">Delete</button>
                        </div>
                        <button v-show="TokenService.isStudent()" class="btn bg-primary text-white"
                            @click="openModal('edit', item)">Borrow</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-else class="text-center mt-8">There's no data here.</p>

        <!-- Modal for edit inventory -->
        <div v-if="modal.show && modal.type !== 'delete' && !TokenService.isStudent()" class="modal modal-open">
            <div class="modal-box">
                <button @click="modal = false" class="mb-4">
                    <span class="material-symbols-outlined">close</span>
                </button>

                <div class="flex items-center gap-3">
                    <div>
                        <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" hidden>
                        <button class="w-40 h-40 relative" @click="triggerFileInput" @mouseover="hover = true"
                            @mouseleave="hover = false">
                            <img :src="previewImage || (inventoryToEdit.photo ? getImage(inventoryToEdit.photo) : 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg')"
                                class="w-40 h-40 object-cover rounded-lg">
                            <div v-show="hover"
                                class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold rounded-lg">
                                {{ modal.type }}
                            </div>
                        </button>
                    </div>

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
                    <button class="btn bg-primary text-white w-full" @click="updateAction" :disabled="isDisabled">{{
                    modal.type === 'add' ? 'Create Inventory' : 'Edit Inventory' }}</button>
                </div>
            </div>
        </div>

        <!-- Modal for delete inventory -->
        <div v-if="modal.show && modal.type === 'delete' && !TokenService.isStudent()" class="modal modal-open">
            <div class="modal-box">
                <p class="text-xl font-bold">Are you sure you want to delete this inventory?</p>
                <div class="flex items-center gap-4 mt-4">
                    <img :src="getImage(inventoryToEdit.photo)" class="w-40 h-40 object-cover rounded-lg">
                    <div>
                        <h1 class="text-lg font-bold">{{ inventoryToEdit.name }}</h1>
                        <h1>Category: {{ inventoryToEdit.category.name }}</h1>
                        <h1>Quantity: {{ inventoryToEdit.quantity_available }}</h1>
                    </div>
                </div>
                <div class="modal-action">
                    <button class="btn bg-red-100 text-red-500 w-56" @click="deleteAction">Delete</button>
                    <button class="btn bg-primary text-white w-56" @click="modal = false">Cancel</button>
                </div>
            </div>
        </div>

        <!-- Modal for borrow inventory -->
        <div v-if="modal.show && modal.type !== 'delete' && TokenService.isStudent()" class="modal modal-open">
            <div class="modal-box">
                <button @click="modal = false" class="mb-4">
                    <span class="material-symbols-outlined">close</span>
                </button>

                <div class="flex items-center gap-3">
                    <img :src="inventoryToEdit.photo ? getImage(inventoryToEdit.photo) : 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg'"
                        class="w-40 h-40 object-cover rounded-lg">

                    <div class="w-full">
                        <h1 class="text-xl font-bold">{{ inventoryToEdit.name }}</h1>
                        <h2 class="font-medium text-gray-500">{{ inventoryToEdit.category.name }}</h2>

                        <div class="mt-4 mb-2">
                            <p class="text-sm font-medium text-gray-400 mb-1">Quantity</p>
                            <input type="text" v-model="inventoryToEdit.quantity_available" placeholder="20"
                                class="input input-bordered focus:border-primary focus:ring-primary w-full" />
                        </div>

                        <div>
                            <p class="text-sm font-medium text-gray-400 mb-1">Date</p>
                            <input type="datetime-local" v-model="inventoryToEdit.date"
                                class="input input-bordered focus:border-primary focus:ring-primary w-full" />
                        </div>
                    </div>
                </div>

                <div class="modal-action">
                    <button class="btn bg-primary text-white w-full" @click="borrowAction"
                        :disabled="disableStudent">Borrow</button>
                </div>
            </div>
        </div>
    </div>
</template>