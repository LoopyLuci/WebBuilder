export class VueAdapter {
    config;
    constructor(config = {}) {
        this.config = config;
    }
    generate() {
        return `<template>
  <div>
    <!-- Vue component -->
  </div>
</template>

<script setup lang="ts">
// Component logic
</script>

<style scoped>
/* Styles */
</style>`;
    }
}
//# sourceMappingURL=index.js.map