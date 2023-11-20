import { createRouter, createWebHistory, } from "vue-router";
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
            components: {
                default: () => import("@/views/People/HouseholdsView.vue"),
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            },
            children: [
                {
                    path: "",
                    name: "households",
                    components: {
                        default: () => import("@/views/People/HouseholdListView.vue"),
                        MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                        MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
                    }
                },
                {
                    path: ":id",
                    name: "household",
                    components: {
                        default: () => import("@/views/People/HouseholdView.vue"),
                        MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                        MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
                    }
                }
            ],
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
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            // Scroll to the element with the corresponding ID in the hash
            return { el: to.hash }
        } else {
            // Scroll to the top of the page
            return { top: 0 }
        }
    },
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
