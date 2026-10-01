<script setup lang="ts">
import type { AppIconDefinition } from '@/utils/iconRegistry'
import { computed, ref, watch } from 'vue'
import { resolveAppIcon } from '@/utils/iconRegistry'

const props = withDefaults(defineProps<{
  name: string
  size?: number | string
}>(), {
  size: '1em',
})

const icon = ref<AppIconDefinition | null>(null)
const normalizedSize = computed(() => typeof props.size === 'number' ? `${props.size}px` : props.size)

let resolveSequence = 0
watch(() => props.name, async (name) => {
  const sequence = ++resolveSequence
  const result = await resolveAppIcon(name)
  if (sequence === resolveSequence) icon.value = result
}, { immediate: true })
</script>

<template>
  <span
    v-if="icon"
    class="app-icon"
    :style="{ width: normalizedSize, height: normalizedSize, fontSize: normalizedSize }"
    aria-hidden="true"
  >
    <component
      :is="icon.component"
      v-if="icon.source === 'iconpark'"
      theme="outline"
      :size="normalizedSize"
      fill="currentColor"
    />
    <component :is="icon.component" v-else />
  </span>
</template>

<style scoped>
.app-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  line-height: 1;
  color: inherit;
}

.app-icon :deep(svg) {
  display: block;
  width: 1em;
  height: 1em;
}
</style>
