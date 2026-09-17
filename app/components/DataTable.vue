<script setup lang="ts">
defineProps<{
  columns: string[]
  rows: string[][]
}>()
</script>

<template>
  <div class="scroll-x">
    <table class="tbl">
      <thead>
        <tr><th v-for="column in columns" :key="column">{{ column }}</th></tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i">
          <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
