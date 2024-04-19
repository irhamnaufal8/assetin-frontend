<script setup>
import { onMounted, ref, computed } from 'vue';
import Axios from 'axios';
import TokenService from '../../services/TokenService';
import { baseURL, getImage, defaultAvatar } from '../../config';
import Sidebar from '../../components/Sidebar.vue';

// Setup Axios
const axiosInstance = Axios.create({
    baseURL: baseURL
});

const bearerToken = {
    headers: { Authorization: `Bearer ${TokenService.getToken()}` }
};

// Get User
const defaultUser = ref({});
const user = ref({});
const previewImage = ref(null);
const fileInput = ref(null);

const fetchUser = async () => {
    try {
        const response = await axiosInstance.get('/users/me', bearerToken);
        user.value = { ...response.data };
        defaultUser.value = { ...response.data };
    } catch (error) {
        console.error('Fetch user failed', error);
    }
};

// Checking Updates
const isChanged = computed(() => {
    return user.value.name !== defaultUser.value.name ||
        (previewImage.value && previewImage.value !== defaultUser.value.avatar) || isAvatarRemoved.value;
});

const isAvatarRemoved = computed(() => {
    return user.value.avatar !== defaultUser.value.avatar
});

// Update Action
const updateAction = () => {
    if (!isChanged.value) return;

    if ((previewImage.value && previewImage.value !== defaultUser.value.avatar)) {
        uploadAvatar(fileInput.value.files[0]);
    } else if (isAvatarRemoved.value) {
        updateProfile(null);
        console.log('Remove Avatar')
    } else {
        updateProfile('NO_AVATAR');
    }
};

// Upload Avatar
const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    try {
        const response = await axiosInstance.post('/photos', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${TokenService.getToken()}`
            }
        });
        console.log(response.data.path);
        updateProfile(response.data.path);
    } catch (error) {
        showModal('Oops!', '😢', 'An error occurred during upload avatar.');
    }
};

// Remove Avatar
const removeAvatar = () => {
    previewImage.value = null;
    user.value.avatar = '';
};

// Update Profile
const updateProfile = async (avatar) => {
    const request = {}
    if (avatar !== 'NO_AVATAR') request.avatar = avatar;
    if (user.value.name !== defaultUser.value.name) request.name = user.value.name;
    try {
        await axiosInstance.put('/users/update-profile', request, bearerToken);
        showModal('Yeay!', '🎉', 'Your profile updated successfully.');
    } catch (error) {
        showModal('Oops!', '😢', 'An error occurred during update profile.');
    }
};

// Preview Avatar
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

// Alert
const alert = ref({
    show: false,
    title: '',
    icon: '',
    message: ''
});

const showModal = (alertTitle, alertIcon, alertMessage) => {
    alert.value.show = true;
    alert.value.title = alertTitle;
    alert.value.icon = alertIcon;
    alert.value.message = alertMessage;
}

const getImageUrl = (avatarPath) => {
    return avatarPath ? getImage(avatarPath) : defaultAvatar;
};

onMounted(() => {
    fetchUser();
});

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

        <!-- Profile Image Section -->
        <div class="grid grid-cols-4 gap-6 items-center mb-4 pt-32">
            <div class="font-semibold">Avatar</div>
            <div class="flex items-center gap-6 w-full col-span-3">
                <div>
                    <img :src="previewImage || getImageUrl(user.avatar)" alt="Profile Image"
                        class="h-20 w-20 rounded-full object-cover">
                    <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" hidden>
                </div>
                <div class="flex">
                    <button class="btn bg-primary text-white" @click="triggerFileInput">Upload</button>
                    <button class="btn bg-red-100 text-red-500 ml-2" @click="removeAvatar">Remove</button>
                </div>
            </div>
        </div>

        <hr class="my-12">

        <!-- Name -->
        <div class="grid grid-cols-4 gap-6 items-center mb-4">
            <div class="font-semibold">Name</div>
            <input type="text" v-model="user.name"
                class="input input-bordered col-span-3 focus:border-primary focus:ring-primary" />
        </div>
        <!-- Email -->
        <div class="grid grid-cols-4 gap-6 items-center mb-4">
            <div class="font-semibold">Email</div>
            <input type="text" v-model="user.email" class="input input-bordered col-span-3" disabled />
        </div>
        <!-- NIS -->
        <div v-if="user.role === 'siswa'" class="grid grid-cols-4 gap-6 items-center">
            <div class="font-semibold">NIS</div>
            <input type="text" v-model="user.nis" class="input input-bordered col-span-3" disabled />
        </div>
        <!-- NIP -->
        <div v-if="user.role != 'siswa'" class="grid grid-cols-4 gap-6 items-center">
            <div class="font-semibold">NIP</div>
            <input type="text" v-model="user.nip" class="input input-bordered col-span-3" disabled />
        </div>

        <div class="flex mt-12 w-full justify-center">
            <button class="btn bg-primary text-white w-[300px]" @click="updateAction" :disabled="!isChanged">Update
                Profile</button>
        </div>
    </div>

    <!-- Modal -->
    <div v-if="alert.show" class="modal modal-open">
        <div class="modal-box relative">
            <h3 class="text-center text-5xl py-2">{{ alert.icon }}</h3>
            <h3 class="font-bold text-lg text-center">{{ alert.title }}</h3>
            <p class="py-4 text-center">{{ alert.message }}</p>
            <div class="modal-action">
                <button class="btn w-full bg-primary text-white" @click="alert.show = false">Okay</button>
            </div>
        </div>
    </div>
</template>