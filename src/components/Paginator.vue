<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true },
  loadPage: { type: Function, required: true },
})

const goToPage = (pageNumber) => {
  if (typeof pageNumber !== 'number') return
  if (pageNumber >= 1 && pageNumber <= props.totalPages && pageNumber !== props.page) {
    props.loadPage(pageNumber, props.itemsPerPage)
  }
}

const pages = computed(() => {
  const total = props.totalPages
  const current = props.page

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '…', total]
  }

  if (current >= total - 2) {
    return [1, '…', total - 3, total - 2, total - 1, total]
  }

  return [1, '…', current - 1, current, current + 1, '…', total]
})
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:px-6"
    aria-label="Pagination"
  >
    <p class="text-sm text-gray-500">
      Page <span class="tabular-nums text-gray-700">{{ page }}</span>
      of <span class="tabular-nums text-gray-700">{{ totalPages }}</span>
    </p>

    <div class="inline-flex items-stretch overflow-hidden rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800 disabled:pointer-events-none disabled:opacity-35"
        :disabled="page === 1"
        aria-label="Previous page"
        @click="goToPage(page - 1)"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
        </svg>
      </button>

      <template v-for="(pageNumber, index) in pages" :key="`${pageNumber}-${index}`">
        <span
          v-if="pageNumber === '…'"
          class="inline-flex h-8 min-w-8 items-center justify-center border-l border-gray-200 text-sm text-gray-400"
          aria-hidden="true"
        >…</span>
        <button
          v-else
          type="button"
          class="inline-flex h-8 min-w-8 items-center justify-center border-l border-gray-200 px-2.5 text-sm tabular-nums transition-colors"
          :class="
            page === pageNumber
              ? 'bg-sky-50 font-semibold text-sky-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          "
          :aria-current="page === pageNumber ? 'page' : undefined"
          @click="goToPage(pageNumber)"
        >
          {{ pageNumber }}
        </button>
      </template>

      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center border-l border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800 disabled:pointer-events-none disabled:opacity-35"
        :disabled="page === totalPages"
        aria-label="Next page"
        @click="goToPage(page + 1)"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
        </svg>
      </button>
    </div>
  </nav>
</template>
