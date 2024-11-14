<template>
  <flip-forge v-model="page" :pages="pages" :options="options"/>
</template>

<script>
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
        mode: "push"
      })
    };
  },
  computed: {
    pageNumber() {
      return parseInt(import.meta.env.VITE_PAGE_NUMBER ?? "")
    },
    options() {
      return {
        theme: {
          "--background": import.meta.env.VITE_BACKGROUND_COLOR,
          "--toolbarColor": import.meta.env.VITE_TOOLBAR_COLOR
        }
      };
    },
    download() {
      return "/" + import.meta.env.VITE_FILE_DOWNLOAD;
    },
    pages() {
      const result = [];
      const padSize = String(this.pageNumber).length;
      for (let i = 1; i <= this.pageNumber; i += 1) {
        result.push(`/page-${String(i).padStart(padSize, "0")}.jpg`);
      }
      return result;
    }
  }
});
</script>
