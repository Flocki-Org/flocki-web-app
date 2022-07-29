<template lang="pug">
.flex.h-full
  //.grid.grid-cols-2.h-full
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
      buttond.rounded-lg.px-4.py-1.inline-flex.items-center.cursor-pointer.text-sm.transition-all(
        class="shadow-[0_1px_4px_rgb(0,0,0,15%)] hover_shadow-[0_2px_16px_rgb(0,0,0,15%)]"
      )
        img.mr-2(
          src="@/assets/icon-google.png"
          width="24"
          height="24"
        )
        | Sign in with Google

    .border-b.border-slate-300.text-center.mb-8
      span.relative.top-3.bg-white.px-5.cursor-default or

    form.mx-20
      .mb-4
        label.block.mb-1.pl-3.text-gray-900(
          for="email"
        ) Email
        input.outline-none.bg-gray-50.border.border-gray-300.text-gray-900.rounded-lg.focus_border-blue-300.focus-visible_border-blue-300.block.w-full.p-3(
          type="email"
          placeholder="Your email address"
        )
      .mb-6
        label.block.mb-1.pl-3.text-gray-900(
          for="password"
        ) Password
        input.outline-none.bg-gray-50.border.border-gray-300.text-gray-900.rounded-lg.focus_border-sky-500.focus-visible_border-sky-500.block.w-full.p-3(
          type="password"
          placeholder="Your password"
        )

      .text-center
        button.text-white.bg-sky-500.hover_bg-sky-400.font-medium.rounded-lg.px-5.py-2.transition-all(
          type="submit"
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