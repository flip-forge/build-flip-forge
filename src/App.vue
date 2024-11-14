<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<style>
body {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 100vh;
}

#app {
  width: 100vw;
  height: 100vh;
  padding: 0 2rem;
}
</style>
