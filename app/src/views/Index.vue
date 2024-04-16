<script setup>
import Axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { baseURL } from '../config';
import TokenService from '../services/TokenService';
import { onMounted } from 'vue';

// To Home Page
const toHome = () => {
  if (TokenService.isAdmin() || TokenService.isSuperAdmin()) {
    router.push('/pending');
  } else if (TokenService.isStudent()) {
    router.push('/home');
  }
};

// Check if user is already logged in
onMounted(() => {
  toHome();
})

// Setup instance Axios
const axiosInstance = Axios.create({
  baseURL: baseURL
});

const router = useRouter();
const view = ref('choose');
const role = ref(null);
const email = ref('');
const password = ref('');
const name = ref('');
const nisOrNip = ref('');
const confirmPassword = ref('');
const modalTitle = ref('');
const modalDescription = ref('');
const showModal = ref(false);
const modalIcon = ref('');

const setView = (p) => {
  view.value = p;
};

const setRole = (r) => {
  role.value = r;
  setView('login');
};

const login = async () => {
  try {
    const response = await axiosInstance.post('/login', {
      email: email.value,
      password: password.value,
      role: role.value
    });
    TokenService.setToken(response.data.access_token);
    if (email.value === 'superadmin@mail.com') {
      TokenService.setRole('superadmin');
    } else {
      TokenService.setRole(role.value);
    }
    toHome();
  } catch (err) {
    modalTitle.value = "Login Failed";
    modalDescription.value = err.response.data.message || 'An error occurred during login.';
    modalIcon.value = '⚠️';
    showModal.value = true;
  }
};

const register = async () => {
  try {
    const request = role.value === 'siswa' ? {
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: confirmPassword.value,
      role: role.value,
      nis: nisOrNip.value
    } : {
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: confirmPassword.value,
      nip: nisOrNip.value,
      role: role.value
    };
    const response = await axiosInstance.post('/register', request);
    modalIcon.value = '🎉';
    modalTitle.value = "Registration Successful";
    modalDescription.value = "Please wait for approval from the admin before you can Sign In.";
    showModal.value = true;
  } catch (err) {
    modalIcon.value = '⚠️';
    modalTitle.value = "Registration Failed";
    modalDescription.value = err || 'An error occurred during registration.';
    showModal.value = true;
  }
};
</script>



<template>
  <div class="flex h-screen">
    <!-- Modal -->
    <div v-if="showModal" class="modal modal-open">
      <div class="modal-box relative">
        <h3 class="text-center text-5xl py-2">{{ modalIcon }}</h3>
        <h3 class="font-bold text-lg text-center">{{ modalTitle }}</h3>
        <p class="py-4 text-center">{{ modalDescription }}</p>
        <div class="modal-action">
          <button class="btn w-full bg-primary text-white" @click="showModal = false">Close</button>
        </div>
      </div>
    </div>

    <!-- Illustration -->
    <div class="w-1/2 bg-primary flex justify-center items-center relative">
      <img src="/assets/onboarding.svg" alt="Illustration" class="max-w-full h-auto">
    </div>

    <!-- Content -->
    <div class="w-1/2 flex flex-col justify-center items-center p-8">
      <!-- Choose Role View -->
      <div v-if="view === 'choose'" class="flex flex-col items-center">
        <div class="flex flex-row justify-center items-center space-x-4 mb-6">
          <button @click="setRole('siswa')"
            class="flex flex-col items-center p-8 border border-primary text-xl font-bold rounded-2xl hover:bg-orange-100 transition-colors"
            style="padding: 80px 70px; min-width: 200px;">
            <span class="text-5xl mb-2">🎓</span>
            <span>Student</span>
          </button>
          <button @click="setRole('admin')"
            class="flex flex-col items-center p-8 border border-primary text-xl font-bold rounded-2xl hover:bg-orange-100 transition-colors"
            style="padding: 80px 70px; min-width: 200px;">
            <span class="text-5xl mb-2">👔</span>
            <span>Admin</span>
          </button>
        </div>
        <h1 class="text-xl font-bold mb-2">Choose your role</h1>
        <p class="text-gray-600">Select the appropriate role to continue to the dashboard.</p>
      </div>

      <!-- Login View -->
      <div v-else-if="view === 'login'" class="w-full flex flex-col items-center space-y-4">
        <img src="/assets/logo.svg" alt="Logo" class="mb-4">
        <input type="email" placeholder="Email" v-model="email"
          class="input input-bordered w-full max-w-lg focus:border-primary focus:ring-primary">
        <input type="password" placeholder="Password" v-model="password"
          class="input input-bordered w-full max-w-lg focus:border-primary focus:ring-primary">
        <button class="btn bg-primary text-white w-full max-w-lg" @click="login">Login</button>
        <p>
          <span class="">New here? <a class="text-primary" href="#" @click="setView('register')">Create an
              account.</a></span>
        </p>
      </div>

      <!-- Register View -->
      <div v-else-if="view === 'register'" class="w-full flex flex-col items-center space-y-4">
        <img src="/assets/logo.svg" alt="Logo" class="mb-4">
        <input type="text" placeholder="Name" v-model="name"
          class="input input-bordered w-full max-w-lg focus:border-primary focus:ring-primary">
        <input type="text" :placeholder="role === 'siswa' ? 'NIS' : 'NIP'" v-model="nisOrNip"
          class="input input-bordered w-full max-w-lg focus:border-primary focus:ring-primary">
        <input type="email" placeholder="Email" v-model="email"
          class="input input-bordered w-full max-w-lg focus:border-primary focus:ring-primary">
        <input type="password" placeholder="Password" v-model="password"
          class="input input-bordered w-full max-w-lg focus:border-primary focus:ring-primary">
        <input type="password" placeholder="Confirm Password" v-model="confirmPassword"
          class="input input-bordered w-full max-w-lg focus:border-primary focus:ring-primary">
        <button class="btn bg-primary text-white w-full max-w-lg" @click="register">Register</button>
        <p>
          <span class="">Already have an account? <a class="text-primary" href="#" @click="setView('login')">Login
              here.</a></span>
        </p>
      </div>
    </div>
  </div>
</template>
