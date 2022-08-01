import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "dashboard",
            components: {
                default: () => import("@/views/DashboardView.vue"),
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            }
        },
        {
            path: "/about",
            name: "about",
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import("../views/AboutView.vue"),
        },
        {
            path: "/login",
            name: "login",
            component: () => import("../views/LoginView.vue"),
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
            ]
        },
        {
            path: "/households",
            name: "households",
            components: {
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            }
        },
        {
            path: "/people/settings",
            name: "people-settings",
            components: {
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            }
        },
        {
            path: "/sermons",
            name: "sermons",
            components: {
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            }
        },
        {
            path: "/ministries",
            name: "ministries",
            components: {
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            }
        },
        {
            path: "/events",
            name: "events",
            components: {
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            }
        },
        {
            path: "/giving",
            name: "giving",
            components: {
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            }
        },
        {
            path: "/website",
            name: "website",
            components: {
                MainSidebar: () => import("@/views/Layout/MainSidebar.vue"),
                MainTopbar: () => import("@/views/Layout/MainTopbar.vue"),
            }
        },
    ],
});

export default router;
