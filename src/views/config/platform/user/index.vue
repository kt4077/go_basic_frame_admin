<script setup lang="ts">
import PlatformConfigPanel from '../components/PlatformConfigPanel.vue'
import { PlatformType } from '@/enums/platform'
</script>

<template>
  <PlatformConfigPanel :type="PlatformType.Api" />
</template>
