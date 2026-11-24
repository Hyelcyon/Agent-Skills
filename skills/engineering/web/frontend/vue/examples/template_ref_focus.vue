<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue';

const inputElement = useTemplateRef<HTMLInputElement>('searchInput');

function focusSearch(): void {
  inputElement.value?.focus();
}

onMounted(() => {
  focusSearch();
});
</script>

<template>
  <div class="search-bar">
    <input ref="searchInput" type="search" placeholder="Quick find..." />
    <button type="button" @click="focusSearch">Focus</button>
  </div>
</template>
