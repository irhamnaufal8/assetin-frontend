<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useRouter, useRoute } from 'vue-router';
import Axios from 'axios';
import TokenService from '../services/TokenService';
import { baseURL, defaultAvatar, getImage } from '../config';

// Variables
const route = useRoute();
const router = useRouter();
const showLogoutModal = ref(false);

// Setup instance Axios
const axiosInstance = Axios.create({
    baseURL: baseURL
});

const bearerToken = {
    headers: { Authorization: `Bearer ${TokenService.getToken()}` }
};

const logout = async () => {
    try {
        await axiosInstance.post('/logout', {}, bearerToken);
        TokenService.removeToken();
        TokenService.removeRole();
        router.push('/');
    } catch (error) {
        console.error('Logout failed', error);
    }
    showLogoutModal.value = false;
};

const getImageUrl = (avatarPath) => {
    return avatarPath ? getImage(avatarPath) : defaultAvatar;
};

onMounted(() => {
    fetchUser();
});

// User Data
const user = ref({});
const fetchUser = async () => {
    try {
        const response = await axiosInstance.get('/users/me', bearerToken);
        user.value = response.data;
    } catch (error) {
        console.error('Fetch user failed', error);
    }
};

</script>

<template>
    <aside class="fixed z-50 left-0 w-[363px] h-screen border-r bg-white border-r-gray-200 p-6">
        <!-- Profile -->
        <RouterLink to="/profile" class="flex items hover:bg-orange-50 transition-colors rounded-lg p-3"
            :class="route.path === '/profile' ? 'bg-orange-50' : ''">
            <div class="flex items-center space-x-4">
                <img :src=getImageUrl(user.avatar) alt="Profile Picture" class="rounded-full w-20 h-20 object-cover">
                <div>
                    <div class="font-bold">{{ user.name }}</div>
                    <div class="text-sm opacity-50">{{ user.email }}</div>
                </div>
            </div>
        </RouterLink>
        <hr class="my-8">

        <!-- Navigation -->
        <ul class="w-full flex flex-col h-full text-base-content">
            <div class="flex flex-col gap-3">
                <div v-if="TokenService.isAdmin() || TokenService.isSuperAdmin()" class="w-full">
                    <RouterLink to="/inventory" class="btn justify-start shadow-none border-none w-full"
                        :class="route.path.includes('/inventory') ? 'bg-primary text-white' : 'bg-transparent text-gray-600'">
                        <span class="material-symbols-outlined">inventory_2</span>
                        Inventories
                    </RouterLink>
                </div>

                <div v-if="TokenService.isAdmin() || TokenService.isSuperAdmin()" class="w-full">
                    <RouterLink to="/loans" class="btn justify-start shadow-none border-none w-full"
                        :class="route.path === '/loans' ? 'bg-primary text-white' : 'bg-transparent text-gray-600'">
                        <span class="material-symbols-outlined">edit_document</span>
                        Loans
                    </RouterLink>
                </div>

                <div v-if="TokenService.isAdmin() || TokenService.isSuperAdmin()" class="w-full">
                    <RouterLink to="/pending" class="btn justify-start shadow-none border-none w-full"
                        :class="route.path === '/pending' ? 'bg-primary text-white' : 'bg-transparent text-gray-600'">
                        <span class="material-symbols-outlined">pending_actions</span>
                        Pending Users
                    </RouterLink>
                </div>

                <div v-if="TokenService.isAdmin() || TokenService.isSuperAdmin()" class="w-full">
                    <RouterLink to="/announcement" class="btn justify-start shadow-none border-none w-full"
                        :class="route.path === '/announcement' ? 'bg-primary text-white' : 'bg-transparent text-gray-600'">
                        <span class="material-symbols-outlined">campaign</span>
                        Announcement
                    </RouterLink>
                </div>

                <div v-if="TokenService.isStudent()" class="w-full">
                    <RouterLink to="/home" class="btn justify-start shadow-none border-none w-full"
                        :class="(route.path === '/home' || route.path.includes('/inventory')) ? 'bg-primary text-white' : 'bg-transparent text-gray-600'">
                        <span class="material-symbols-outlined">home</span>
                        Home
                    </RouterLink>
                </div>

                <RouterLink v-show="TokenService.isStudent()" to="/history"
                    class="btn justify-start shadow-none border-none"
                    :class="route.path === '/history' ? 'bg-primary text-white' : 'bg-transparent text-gray-600'">
                    <span class="material-symbols-outlined">history</span>
                    History
                </RouterLink>
            </div>

            <!-- Logout -->
            <div class="absolute bottom-4 w-full left-4 pr-8">
                <button @click="showLogoutModal = true"
                    class="btn justify-start w-full bg-red-100 text-red-500 shadow-none border-none">
                    <span class="material-symbols-outlined">logout</span>
                    Logout
                </button>
            </div>
        </ul>
    </aside>

    <!-- Logout Modal -->
    <div v-if="showLogoutModal" class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg">Confirm Logout</h3>
            <p class="py-4">Are you sure you want to logout?</p>
            <div class="modal-action">
                <button class="btn" @click="showLogoutModal = false">Cancel</button>
                <button class="btn bg-primary text-white" @click="logout">Logout</button>
            </div>
        </div>
    </div>
</template>