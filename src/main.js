import { createApp } from 'vue'
import { createRouter, createWebHistory } from "vue-router";

import App from './App.vue'
import HomeView from "./HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
  ],
})

const app = createApp(App)

app.use(router)

app.mount('#app')
