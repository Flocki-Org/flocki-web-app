<script setup>
import { ref, defineProps } from 'vue';

const { page, totalPages, itemsPerPage, loadPage } = defineProps(['page', 'totalPages', 'itemsPerPage', 'loadPage']);

const goToPage = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages) {
    loadPage(pageNumber, itemsPerPage);
  }
};
</script>

<template>
  <div class="pagination-container flex items-center mt-4" v-if="totalPages > 1">
    <!-- Previous button -->
    <button
      class="pagination-button"
      :disabled="page === 1"
      @click="goToPage(page - 1)"
    >
      &lt; Prev
    </button>

    <!-- Page buttons -->
    <template v-if="totalPages <= 5">
      <!-- Display all pages if total pages are less than or equal to 5 -->
      <template v-for="pageNumber in totalPages">
        <button
          class="pagination-button"
          :class="{ 'current-page': page === pageNumber }"
          @click="goToPage(pageNumber)"
        >
          {{ pageNumber }}
        </button>
      </template>
    </template>

    <!-- Display ellipses and nearby pages for larger total pages -->
    <template v-else>
      <template v-if="page <= 3">
        <template v-for="pageNumber in [1, 2, 3, 4, 5, '...', totalPages]">
          <button
            class="pagination-button"
            :class="{ 'current-page': page === pageNumber }"
            @click="goToPage(pageNumber)"
            v-if="pageNumber !== '...'"
          >
            {{ pageNumber }}
          </button>
          <span v-else>...</span>
        </template>
      </template>

      <template v-else-if="page > totalPages - 3">
        <template v-for="pageNumber in [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]">
          <button
            class="pagination-button"
            :class="{ 'current-page': page === pageNumber }"
            @click="goToPage(pageNumber)"
            v-if="pageNumber !== '...'"
          >
            {{ pageNumber }}
          </button>
          <span v-else>...</span>
        </template>
      </template>

      <template v-else>
        <template v-for="pageNumber in [1, '...', page - 1, page, page + 1, '...', totalPages]">
          <button
            class="pagination-button"
            :class="{ 'current-page': page === pageNumber }"
            @click="goToPage(pageNumber)"
            v-if="pageNumber !== '...'"
          >
            {{ pageNumber }}
          </button>
          <span v-else>...</span>
        </template>
      </template>
    </template>

    <!-- Next button -->
    <button
      class="pagination-button"
      :disabled="page === totalPages"
      @click="goToPage(page + 1)"
    >
      Next &gt;
    </button>
  </div>
</template>


<style>

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px; /* Add some margin if needed */
}

.pagination-button {
  margin: 0 4px;
  padding: 8px 12px;
  border: 1px solid #3490dc;
  background-color: #fff;
  color: #3490dc;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s, color 0.3s;
}

.pagination-button:hover {
  background-color: #3490dc;
  color: #fff;
}

.current-page {
  background-color: #3490dc;
  color: #fff;
}
</style>
