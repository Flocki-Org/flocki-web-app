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
    }
  }
});

const pinia = createPinia().use(createORM());

const app = createApp(App);

app.config.globalProperties.$filters = {
  shortDateTime(date) {
    return moment(date).format('D MMM \'YY, hh:mma');
  }
}

app.use(pinia);
app.use(router);
app.use(VueAxios, axios);
app.provide('axios', app.config.globalProperties.axios);
app.use(auth);
app.component(Skeletor.name, Skeletor);

app.mount("#app");
