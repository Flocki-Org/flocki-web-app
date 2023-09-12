import { createApp } from "vue";
import { createPinia } from "pinia";
import { createORM } from 'pinia-orm';
import App from "./App.vue";
import router from "./router";
import { axios, VueAxios } from './axios'
import { createAuth } from '@websanova/vue-auth';
import driverAuthBearer from '@/drivers/auth/bearer.js';
import driverHttpAxios from '@websanova/vue-auth/dist/drivers/http/axios.1.x.esm.js';
import driverRouterVueRouter from '@websanova/vue-auth/dist/drivers/router/vue-router.2.x.esm.js';
import driverOAuth2Google from '@websanova/vue-auth/dist/drivers/oauth2/google.esm.js';
import { Skeletor } from 'vue-skeletor';
import moment from 'moment';

import "@/assets/base.css";
import 'vue-skeletor/dist/vue-skeletor.css';

const auth = createAuth({
  plugins: {
    http: axios,
    router: router
  },
  drivers: {
    http: driverHttpAxios,
    auth: driverAuthBearer,
    router: driverRouterVueRouter,
    oauth2: {
      google: driverOAuth2Google,
    }
  },
  options: {
    loginData: {
      url: 'login'
    },
    fetchData: {
      url: 'users'
    },
    refreshToken: {
      autoRefreshToken: false, // Disable automatic token refreshing
    },
  }
});

const pinia = createPinia().use(createORM());

const app = createApp(App);

app.config.globalProperties.$filters = {
  humanize(date) {
    let today = new moment()
    let momentDate = moment(date)
    return moment.duration(today.diff(momentDate)).humanize()
  },
  shortDateTime(date) {
    return moment(date).format('D MMM \'YY, hh:mma');
  },
  fullDateTime(date) {
    return moment(date).format('D MMMM YYYY, hh:mma');
  },
  humanDate(date) {
    return moment(date).format('D MMMM YYYY');
  },
  durationInYearsOrMonths(date) {
    let today = new moment()
    let momentDate = moment(date)
    let diffInMonths = today.diff(momentDate, 'months')
    let diffInYears = today.diff(momentDate, 'years')

    if (diffInMonths < 12) {
      return moment.duration(today.diff(momentDate)).months() + ' month' + (diffInMonths === 1 ? '' : 's');
    } else {
      return moment.duration(today.diff(momentDate)).years() + ' year' + (diffInYears === 1 ? '' : 's');
    }
  }
}

app.use(pinia);
app.use(router);
app.use(VueAxios, axios);
app.provide('axios', app.config.globalProperties.axios);
app.use(auth);
app.component(Skeletor.name, Skeletor);

app.mount("#app");
