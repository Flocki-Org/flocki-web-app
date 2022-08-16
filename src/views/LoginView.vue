<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '@websanova/vue-auth'
import Button from '@/components/Forms/Button.vue'

const auth = useAuth()

const isLoggingIn = ref(false)
const error = ref('')
const credentials = reactive({
  email: '',
  password: ''
})

const login = () => {
  if (!isLoggingIn.value) {
    isLoggingIn.value = true;
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
      });
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
        label.block.mb-1.pl-3.text-gray-900(
          for="email"
        ) Email
        input.outline-none.bg-gray-50.border.border-gray-300.text-gray-900.rounded-lg.focus_border-blue-300.focus-visible_border-blue-300.block.w-full.p-3(
          type="email"
          placeholder="Your email address"
          v-model="credentials.email"
        )
      .mb-6
        label.block.mb-1.pl-3.text-gray-900(
          for="password"
        ) Password
        input.outline-none.bg-gray-50.border.border-gray-300.text-gray-900.rounded-lg.focus_border-sky-500.focus-visible_border-sky-500.block.w-full.p-3(
          type="password"
          placeholder="Your password"
          v-model="credentials.password"
        )

      .text-center
        //button.inline-flex.items-center.text-white.bg-sky-500.hover_bg-sky-400.font-medium.rounded-lg.px-5.py-2.transition-all(
          type="submit"
          :class="{ 'bg-sky-300 hover_bg-sky-300 cursor-default': isLoggingIn }"
          )
        Button(
          type="submit"
          :class="{ 'bg-sky-300 hover_bg-sky-300 cursor-default': isLoggingIn }"
        )
          svg.mr-2.w-4.h-4.animate-spin.fill-sky-500(
            :class="{ 'hidden': !isLoggingIn, 'fill-sky-300': isLoggingIn }"
            aria-hidden="true"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          )
            path(
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            )
            path(
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            )
          | SIGN IN

    .mt-12.text-center
      | Don't have an account?
      |
      a(href="#") Sign-up
      | .

  .two.bg-no-repeat.bg-cover(class="bg-[url('@/assets/signin-background.jpg')] w-3/5")
</template>

<style>
</style>