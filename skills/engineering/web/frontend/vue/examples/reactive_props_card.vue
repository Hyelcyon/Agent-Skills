<script setup lang="ts">
import { computed } from 'vue';

interface CardProps {
  title: string;
  initialCount?: number;
  maxLimit?: number;
}

const { title, initialCount = 0, maxLimit = 100 } = defineProps<CardProps>();
const searchQuery = defineModel<string>('query', { default: '' });

const isMaxReached = computed(() => initialCount >= maxLimit);
</script>

<template>
  <div class="user-card">
    <h3>{{ title }}</h3>
    <p>Count: {{ initialCount }} / {{ maxLimit }}</p>
    <p v-if="isMaxReached" class="alert">Maximum threshold reached</p>
    <input v-model="searchQuery" placeholder="Filter attributes..." />
  </div>
</template>
