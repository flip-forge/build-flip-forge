export default {
  "*": "prettier --check",
  "*.{vue,ts}": () => "vue-tsc --build --force --noEmit",
};
