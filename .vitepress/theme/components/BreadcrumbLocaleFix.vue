<script setup>
import { onMounted, watch } from 'vue'
import { useData } from 'vitepress'

const { localeIndex } = useData()

const ZH_LABEL_MAP = {
  guide: '指南',
  api: 'API 文件',
}

function fix() {
  if (typeof document === 'undefined') return

  // Fix home link
  const prefix = localeIndex.value && localeIndex.value !== 'root'
    ? `/${localeIndex.value}/`
    : '/'
  document.querySelectorAll('.tk-article-breadcrumb a.home').forEach(el => {
    if (el.getAttribute('href') !== prefix) {
      el.setAttribute('href', prefix)
    }
  })

  // Fix directory labels for zh locale
  if (localeIndex.value === 'zh') {
    document.querySelectorAll('.tk-article-breadcrumb .tk-breadcrumb__item').forEach(item => {
      const link = item.querySelector('a, span')
      if (!link) return
      const text = link.textContent?.trim()
      if (text && ZH_LABEL_MAP[text]) {
        link.textContent = ZH_LABEL_MAP[text]
      }
    })
  }
}

function delayedFix() {
  setTimeout(fix, 50)
}

onMounted(delayedFix)
watch(localeIndex, delayedFix)
</script>

<template></template>
