import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import axios from 'axios';
import VueAxios from 'vue-axios';
import { createAuth } from '@websanova/vue-auth';
import driverAuthBearer from '@/drivers/auth/bearer.js';
import driverHttpAxios from '@websanova/vue-auth/dist/drivers/http/axios.1.x.esm.js';
import driverRouterVueRouter from '@websanova/vue-auth/dist/drivers/router/vue-router.2.x.esm.js';
import driverOAuth2Google from '@websanova/vue-auth/dist/drivers/oauth2/google.esm.js';

import "@/assets/base.css";

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

axios.defaults.baseURL = 'http://localhost:8000';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueAxios, axios);
app.use(auth);

app.mount("#app");
