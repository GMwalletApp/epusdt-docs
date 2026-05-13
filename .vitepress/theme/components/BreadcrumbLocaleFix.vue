<script setup>
import { onMounted, watch } from 'vue'
import { useData } from 'vitepress'

const { localeIndex } = useData()

function fix() {
  if (typeof document === 'undefined') return
  const prefix = localeIndex.value && localeIndex.value !== 'root'
    ? `/${localeIndex.value}/`
    : '/'
  document.querySelectorAll('.tk-article-breadcrumb a.home').forEach(el => {
    if (el.getAttribute('href') !== prefix) {
      el.setAttribute('href', prefix)
    }
  })
}

onMounted(fix)
watch(localeIndex, () => setTimeout(fix, 50))
</script>

<template></template>
