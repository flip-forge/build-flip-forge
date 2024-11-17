<template>
  <flip-forge
    v-model="page"
    :pages="pages"
    :low-res-pages="lowResPages"
    :options="options"
    :download-url="download"
    :width="width"
    :height="height"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouteQuery } from "@vueuse/router";
import FlipForge, { type FlipForgeOptions } from "@flip-forge/vue-flip-forge";
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
    options(): FlipForgeOptions {
      return {
        theme: {
          "--background": import.meta.env.VITE_BACKGROUND_COLOR,
          "--toolbarColor": import.meta.env.VITE_TOOLBAR_COLOR,
        },
      };
    },
    width(): number {
      return parseInt(import.meta.env.VITE_SVG_IMAGE_WIDTH ?? "", 10);
    },
    height(): number {
      return parseInt(import.meta.env.VITE_SVG_IMAGE_HEIGHT ?? "", 10);
    },
    baseUrl() {
      return import.meta.env.BASE_URL.replace(/\/$/u, "");
    },
    download() {
      return [this.baseUrl, import.meta.env.VITE_FILE_DOWNLOAD].join("/");
    },
    pages() {
      return this.getPages("svg");
    },
    lowResPages() {
      return this.getPages("jpg");
    },
  },
  methods: {
    getPages(ext: string): string[] {
      const result = [];
      for (let i = 1; i <= this.pageNumber; i += 1) {
        result.push([this.baseUrl, ext, `${i}.${ext}`].join("/"));
      }
      return result;
    },
  },
});
</script>
