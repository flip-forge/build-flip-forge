<template>
  <flip-forge
    v-model="page"
    :pages="pages"
    :options="options"
    :download-url="download"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouteQuery } from "@vueuse/router";
import FlipForge from "@flip-forge/vue-flip-forge";
import "@flip-forge/vue-flip-forge/dist/style.css";

export default defineComponent({
  components: { FlipForge },
  data() {
    return {
      page: useRouteQuery("page", "0", {
        transform: Number,
        mode: "push",
      }),
    };
  },
  computed: {
    pageNumber() {
      return parseInt(import.meta.env.VITE_PAGE_NUMBER ?? "", 10);
    },
    options() {
      return {
        theme: {
          "--background": import.meta.env.VITE_BACKGROUND_COLOR,
          "--toolbarColor": import.meta.env.VITE_TOOLBAR_COLOR,
        },
      };
    },
    baseUrl() {
      return import.meta.env.BASE_URL.replace(/\/$/u, "");
    },
    download() {
      return [this.baseUrl, import.meta.env.VITE_FILE_DOWNLOAD].join("/");
    },
    pages() {
      const result = [];
      const padSize = String(this.pageNumber).length;
      for (let i = 1; i <= this.pageNumber; i += 1) {
        const pageFile = `page-${String(i).padStart(padSize, "0")}.jpg`;
        result.push([this.baseUrl, pageFile].join("/"));
      }
      return result;
    },
  },
});
</script>
