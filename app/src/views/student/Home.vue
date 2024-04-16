<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Axios from 'axios';
import TokenService from '../../services/TokenService';
import { baseURL } from '../../config';
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
    <Sidebar />
    <!-- page content -->
    <div class="pl-[403px] pr-[40px] py-[42px]">

    </div>
</template>