export class SvelteAdapter {
    config;
    constructor(config = {}) {
        this.config = config;
    }
    generate() {
        return `<script lang="ts">
  // Component logic
</script>

<div>
  <!-- Svelte component -->
</div>

<style>
  /* Styles */
</style>`;
    }
}
//# sourceMappingURL=index.js.map