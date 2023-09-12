import { createRouter, createWebHistory } from "vue-router";
import { inject } from 'vue'
import axios from 'axios';

//const axios = inject('axios')

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "dashboard",
            //When the user enters the dashboard we check if the church entity has been created already.  
            beforeEnter: checkIfChurchExists(),
            components: {
                default: () => import("@/views/DashboardView.vue"),
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            },
            meta: {
                auth: true
            }
        },
        {
            path: "/login",
            name: "login",
            component: () => import("../views/LoginView.vue"),
        },
        {
            path: "/setup",
            name: "setup",
            component: () => import("../views/SetupChurchWizard.vue"),
        },
        {
            path: "/people",
            components: {
                default: () => import("@/views/People/PeopleView.vue"),
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            },
            children: [
                {
                    path: "",
                    name: "people",
                    components: {
                        default: () => import("@/views/People/PeopleListView.vue"),
                        MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                        MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
                    }
                },
                {
                    path: ":id",
                    name: "person",
                    components: {
                        default: () => import("@/views/People/PersonView.vue"),
                        MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                        MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
                    }
                },
            ],
            meta: {
                auth: true
            },
        },
        {
            path: "/households",
            name: "households",
            components: {
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            },
            meta: {
                auth: true
            },
        },
        {
            path: "/people/settings",
            name: "people-settings",
            components: {
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            },
            meta: {
                auth: true
            },
        },
        {
            path: "/sermons",
            name: "sermons",
            components: {
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            },
            meta: {
                auth: true
            },
        },
        {
            path: "/ministries",
            name: "ministries",
            components: {
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            },
            meta: {
                auth: true
            },
        },
        {
            path: "/events",
            name: "events",
            components: {
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            },
            meta: {
                auth: true
            },
        },
        {
            path: "/giving",
            name: "giving",
            components: {
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            },
            meta: {
                auth: true
            },
        },
        {
            path: "/website",
            name: "website",
            components: {
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            },
            meta: {
                auth: true
            },
        },
    ],
});

export default router;

function checkIfChurchExists() {
    return (to, from, next) => {
        // Make an API call to check if the entity exists;
        axios.get('/church')
            .then(response => {
                next();
             })
            .catch((err) => {
                console.log(err);
                next('setup');
            });
    }
}