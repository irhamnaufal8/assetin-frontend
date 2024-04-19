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

// Announcement data
const dataList = ref([]);
const data = ref(null);

const fetchData = async () => {
    try {
        const response = await axiosInstance.get('/articles');
        dataList.value = response.data;
    } catch (error) {
        console.error('Fetch data failed', error)
    }
}

const updateData = async (image) => {
    if (image !== 'NO_IMAGE') data.value.banner = image;
    const body = {
        title: data.value.title,
        link: data.value.link,
        banner: data.value.banner
    }
    try {
        if (modal.value.type === 'add') {
            await axiosInstance.post('/articles', body);
        } else if (modal.value.type === 'edit') {
            await axiosInstance.put(`/articles/${data.value.id}`, body);
        }
        fetchData();
        modal.value.show = false;
    } catch (error) {
        console.error('Update data failed', error)
    }
}

const deleteData = async () => {
    try {
        await axiosInstance.delete(`/articles/${data.value.id}`);
        fetchData();
        modal.value.show = false;
    } catch (error) {
        console.error('Delete data failed', error)
    }
}

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
        updateData(response.data.path);
    } catch (error) {
        console.error('Upload photo failed', error);
    }
};

// Detail Modal
const modal = ref({
    show: false,
    type: 'add'
});
const openModal = (type, input) => {
    previewImage.value = null;
    data.value = input;
    modal.value = {
        show: true,
        type: type
    };
};

// Main Action
const mainAction = () => {
    if (previewImage.value) {
        uploadPhoto(fileInput.value.files[0]);
    } else {
        updateData('NO_IMAGE')
    }
}

// Disable Main Button
const isDisabled = computed(() => {
    return !data.value.title || !data.value.link || (!data.value.banner && !previewImage.value);
})

onMounted(() => {
    fetchData()
})

</script>

<template>
    <Sidebar />
    <div class="relative pl-[403px] pr-[40px] pb-[18px]">
        <!-- Header -->
        <div class="fixed z-40 right-0 left-0 pl-[403px] pr-[40px] pt-4 bg-white">
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold">Announcement</h1>
                <button class="btn bg-primary rounded-full text-white" @click="openModal('add', {})">
                    <span class="material-symbols-outlined">add</span> Create Announcement
                </button>
            </div>
            <hr class="mt-4">
        </div>

        <div class="pt-[100px]"></div>

        <!-- Table for announcement -->
        <table class="table w-full text-center">
            <thead>
                <tr>
                    <th class="w-1/4">Banner</th>
                    <th class="w-1/4">Title</th>
                    <th class="w-1/6">Link</th>
                    <th class="w-1/6"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in dataList" :key="item.id">
                    <td class="flex justify-center">
                        <img :src="getImage(item.banner)" alt="Inventory Image"
                            class="h-20 w-full rounded-md object-cover">
                    </td>
                    <td>{{ item.title }}</td>
                    <td><a :href="item.link" class="w-full text-blue-500 underline">{{ item.link }}</a></td>
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
        <p v-show="!dataList.length" class="text-center pt-[100px]">There's no data here.</p>

        <!-- Modal for update data -->
        <div v-if="modal.show && modal.type !== 'delete'" class="modal modal-open">
            <div class="modal-box">
                <button @click="modal = false" class="mb-4">
                    <span class="material-symbols-outlined">close</span>
                </button>

                <!-- Banner -->
                <div class="mb-4">
                    <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" hidden>
                    <button class="w-full h-56 relative" @click="triggerFileInput" @mouseover="hover = true"
                        @mouseleave="hover = false">
                        <img :src="previewImage || (data.banner ? getImage(data.banner) : 'https://ludus.id/wp-content/uploads/2023/09/Hero-Banner-Placeholder-Dark-2500x1172-1.png')"
                            class="w-full h-56 object-cover rounded-lg">
                        <div v-show="hover"
                            class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold transition-all rounded-lg">
                            {{ modal.type }}
                        </div>
                    </button>
                </div>

                <!-- Text Field -->
                <div class="flex flex-col gap-2">
                    <div>
                        <p class="text-sm font-medium text-gray-600 mb-1">Title</p>
                        <input type="text" v-model="data.title" placeholder="Give a title.."
                            class="input input-bordered focus:border-primary focus:ring-primary w-full" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-600 mb-1">Link</p>
                        <input type="text" v-model="data.link" placeholder="Link to the announcement.."
                            class="input input-bordered focus:border-primary focus:ring-primary w-full" />
                    </div>
                </div>

                <!-- Main Action -->
                <div class="modal-action">
                    <button class="btn bg-primary text-white w-full" @click="mainAction" :disabled="isDisabled">{{
                    modal.type === 'add' ? 'Create Announcement' : 'Edit Announcement' }}</button>
                </div>
            </div>
        </div>

        <!-- Modal for delete inventory -->
        <div v-if="modal.show && modal.type === 'delete'" class="modal modal-open">
            <div class="modal-box">
                <button @click="modal = false" class="mb-4">
                    <span class="material-symbols-outlined">close</span>
                </button>

                <!-- Banner -->
                <div class="mb-4">
                    <img :src="previewImage || (data.banner ? getImage(data.banner) : 'https://ludus.id/wp-content/uploads/2023/09/Hero-Banner-Placeholder-Dark-2500x1172-1.png')"
                        class="w-full h-56 object-cover rounded-lg">
                </div>

                <!-- Text Field -->
                <div class="flex flex-col gap-2">
                    <div>
                        <p class="text-sm font-medium text-gray-600 mb-1">Title</p>
                        <div class="w-full">{{ data.title }}</div>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-600 mb-1">Link</p>
                        <a :href="data.link" class="w-full text-blue-500 underline">{{ data.link }}</a>
                    </div>
                </div>

                <!-- Main Action -->
                <div class="modal-action">
                    <button class="btn bg-red-100 text-red-500 w-56" @click="deleteData">Delete</button>
                    <button class="btn bg-primary text-white w-56" @click="modal = false">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>