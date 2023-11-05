<template>
  <div>
    {{ formattedAddress }}
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const { addressFormat, address } = defineProps(['addressFormat', 'address']);

// Create a computed property to format the address
const formattedAddress = computed(() => {
  if (!addressFormat) {
    return 'N/A'; // Handle the case when addressFormat is not provided
  }
  if (!address) {
    return 'N/A'; // Handle the case when addressFormat is not provided
  }
  // Define a mapping of placeholders to address properties
  const placeholderMap = {
    type: address.type,
    streetNumber: address.street_number,
    street: address.street,
    suburb: address.suburb,
    city: address.city,
    province: address.province,
    country: address.country,
    postalCode: address.postal_code,
    newline: '\n', // Define newline as a new line character
  };

  // Replace placeholders in addressFormat with actual values
  const formatted = addressFormat.replace(/\[\[(\w+)\]\]/g, (match, key) => {
    console.log(address);
    console.log(placeholderMap);
    console.log(match, key, placeholderMap[key]);
    if (placeholderMap[key] !== undefined) {
      return placeholderMap[key];
    }
    return match; // Return the original placeholder if not found in placeholderMap
  });

  return formatted;
});
</script>



