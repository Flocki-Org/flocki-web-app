<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '@websanova/vue-auth'
import Button from '@/components/Forms/Button.vue'
import Label from '@/components/Forms/Label.vue'
import Input from '@/components/Forms/Input.vue'
import { getFullImageUrl } from '@/imageUtils';

const auth = useAuth()

const isLoggingIn = ref(false)
const error = ref('')
const credentials = reactive({
  email: '',
  password: ''
})

const login = () => {
  if (!isLoggingIn.value) {
    isLoggingIn.value = true
    //error.value = ''

    
    const params = new URLSearchParams({
      username: credentials.email,
      password: credentials.password
    });

    auth
      .login({
        data: params.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .catch((err) => {
        console.log('Login failed');

        if (err.response.status === 422) {
          error.value = 'Incorrect email or password.';
        } else if (err.response.status === 403) {
          error.value = err.response.data.detail;
        }

        isLoggingIn.value = false;
      })
  }
}
</script>

<template>  
  <div class="flex h-full">
    <div class="one p-5 w-2/5">
      <div class="logo">
        <router-link to="/"><img class="hover_opacity-80 transition-all" :src="getFullImageUrl('/church/logo')" onerror="this.src = ''" width="80"></router-link>
      </div>
      <h1 class="mt-20 text-center">Sign In</h1>
      <div class="mt-12 mb-5 text-center">
        <button class="rounded-lg px-4 py-1 inline-flex items-center cursor-pointer text-sm bg-white transition-all shadow-[0_1px_4px_rgb(0,0,0,15%)] hover_shadow-[0_2px_16px_rgb(0,0,0,15%)]"><img class="mr-2" src="@/assets/icon-google.png" width="24" height="24">Sign in with Google</button>
      </div>
      <div class="border-b border-slate-300 text-center mb-8"><span class="relative top-3 bg-main px-5 cursor-default">or</span></div>
      <div class="p-4 mx-20 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" :class="{ hidden: !error }">{{ error }}</div>
      <form class="mx-20" @submit.prevent="login">
        <div class="mb-4">
          <Label class="pl-3" for-id="email">Email</Label>
          <Input id="email" type="email" placeholder="Your email address" v-model="credentials.email"></Input>
        </div>
        <div class="mb-6">
          <Label class="pl-3" for-id="password">Password</Label>
          <Input id="password" type="password" placeholder="Your password" v-model="credentials.password"></Input>
        </div>
        <div class="text-center">
          <Button type="submit" :show-loader="isLoggingIn">SIGN IN</Button>
        </div>
      </form>
      <div class="mt-12 text-center">
        Don't have an account?
        <a href="#">Sign-up</a>.
      </div>
    </div>
    <div class="two bg-no-repeat bg-cover bg-[url('@/assets/signin-background.jpg')] w-3/5"></div>
  </div>
</template>

<style>

</style>