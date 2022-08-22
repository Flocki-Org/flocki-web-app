<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '@websanova/vue-auth'
import Button from '@/components/Forms/Button.vue'
import Label from '@/components/Forms/Label.vue'
import Input from '@/components/Forms/Input.vue'

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

<template lang="pug">
.flex.h-full
  .one.p-5(class="w-2/5")
    .logo
      router-link(
        to="/"
      )
        img.hover_opacity-80.transition-all(
          src="@/assets/lsbc-logo.svg"
          width="185"
        )

    h1.mt-20.text-center Sign In

    .mt-12.mb-5.text-center
      button.rounded-lg.px-4.py-1.inline-flex.items-center.cursor-pointer.text-sm.bg-white.transition-all(
        class="shadow-[0_1px_4px_rgb(0,0,0,15%)] hover_shadow-[0_2px_16px_rgb(0,0,0,15%)]"
      )
        img.mr-2(
          src="@/assets/icon-google.png"
          width="24"
          height="24"
        )
        | Sign in with Google

    .border-b.border-slate-300.text-center.mb-8
      span.relative.top-3.bg-main.px-5.cursor-default or

    .p-4.mx-20.mb-4.text-sm.text-red-700.bg-red-100.rounded-lg(
      :class="{ hidden: !error }"
    ) {{ error }}

    form.mx-20(
      @submit.prevent="login"
    )
      .mb-4
        Label.pl-3(
          for-id="email"
        ) Email
        Input(
          id="email"
          type="email"
          placeholder="Your email address"
          v-model="credentials.email"
        )

      .mb-6
        Label.pl-3(
          for-id="password"
        ) Password
        Input(
          id="password"
          type="password"
          placeholder="Your password"
          v-model="credentials.password"
        )

      .text-center
        Button(
          type="submit"
          :show-loader="isLoggingIn"
        ) SIGN IN

    .mt-12.text-center
      | Don't have an account?
      |
      a(href="#") Sign-up
      | .

  .two.bg-no-repeat.bg-cover(class="bg-[url('@/assets/signin-background.jpg')] w-3/5")
</template>

<style>
</style>