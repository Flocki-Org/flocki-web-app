<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '@websanova/vue-auth'
import Button from '@/components/Forms/Button.vue'
import Label from '@/components/Forms/Label.vue'
import Input from '@/components/Forms/Input.vue'
import { getFullImageUrl } from '@/imageUtils'
import flockiLogo from '@/assets/flocki_logo.jpg'

const auth = useAuth()
const logoSrc = ref(getFullImageUrl('/church/logo'))
const useFallbackLogo = () => {
  logoSrc.value = flockiLogo
}

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
        // The published LoginOptions type omits headers. The axios driver still forwards them.
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      } as Parameters<typeof auth.login>[0])
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
  <div class="flex min-h-full flex-col lg:flex-row">
    <div class="flex w-full flex-col p-5 sm:p-8 lg:w-2/5">
      <div class="logo">
        <router-link class="inline-flex items-center gap-2.5 no-underline" to="/">
          <img class="h-10 w-10 rounded-md object-cover transition-opacity hover:opacity-80" :src="logoSrc" alt="Flocki" @error="useFallbackLogo">
          <span class="text-lg font-semibold tracking-tight text-gray-900">Flocki</span>
        </router-link>
      </div>
      <div class="mx-auto w-full max-w-md flex-1">
        <h1 class="mt-10 text-center sm:mt-16 lg:mt-20">Sign in</h1>
        <p class="mt-2 text-center text-sm text-gray-500">Welcome back to your church workspace.</p>
        <div class="mt-8 mb-5 text-center sm:mt-10">
          <button type="button" class="inline-flex cursor-pointer items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"><img class="mr-2" src="@/assets/icon-google.png" width="20" height="20" alt="">Sign in with Google</button>
        </div>
        <div class="mb-8 border-b border-gray-200 text-center"><span class="relative top-2.5 bg-main px-4 text-xs uppercase tracking-wide text-gray-400">or</span></div>
        <div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" :class="{ hidden: !error }">{{ error }}</div>
        <form class="w-full" @submit.prevent="login">
          <div class="mb-4">
            <Label class="pl-3" for-id="email">Email</Label>
            <Input id="email" type="email" placeholder="Your email address" v-model="credentials.email"></Input>
          </div>
          <div class="mb-6">
            <Label class="pl-3" for-id="password">Password</Label>
            <Input id="password" type="password" placeholder="Your password" v-model="credentials.password"></Input>
          </div>
          <div>
            <Button class="w-full justify-center" type="submit" :show-loader="isLoggingIn">Sign in</Button>
          </div>
        </form>
        <div class="mt-10 text-center sm:mt-12">
          Don't have an account?
          <a href="#">Sign-up</a>.
        </div>
      </div>
    </div>
    <div
      class="hidden min-h-48 flex-1 bg-cover bg-no-repeat bg-[url('@/assets/signin-background.jpg')] sm:min-h-64 lg:block lg:w-3/5 lg:min-h-full"
      role="presentation"
      aria-hidden="true"
    ></div>
  </div>
</template>
