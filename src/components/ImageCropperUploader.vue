<script setup>
import {ref, defineEmits , inject, onMounted, onUnmounted} from 'vue';
import VueCropper from 'vue-cropperjs'; // Import VueCropper
import 'cropperjs/dist/cropper.css';

const fileInput = ref(null);
const dropZone = ref(null);
const hiddenFileInput = ref(null);
const showCropper = ref(false);
const imgSrc = ref('');
const cropper = ref(null);
const cropButton = ref(null);
const { showImageCropper, profileId } = defineProps(['showImageCropper', 'profileId']);
const emit = defineEmits(['imageCropperCancelled', 'imageCropperUploadedSuccess']);
const axios = inject('axios')

const handleFileChange = () => {
  const file = fileInput.value.files[0];
  imgSrc.value = URL.createObjectURL(file);
  showCropper.value = true;
};

const handleClick = () => {
  fileInput.value.click();
};

const cropImage = () => {
  // Get the cropped image data
  const croppedData = cropper.value.getCroppedCanvas().toDataURL('image/jpeg');
  //console.log(croppedData);
  // You can send `croppedData` to your server or perform other actions with it

  // Reset the cropper and hide it
  showCropper.value = false;
  imgSrc.value = '';
  // send cropped image to server endpoint /people/profile_image?id=profileId
  // Create a FormData object to send the cropped image data
  const formData = new FormData();
  const base64Data = croppedData.split(',')[1];
  const blob = atob(base64Data);
  const arrayBuffer = new ArrayBuffer(blob.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < blob.length; i++) {
    uint8Array[i] = blob.charCodeAt(i);
  }

  const file = new Blob([uint8Array], { type: 'image/jpeg' });

  // Append the file to FormData
  formData.append('file', file, 'image.jpg');
  // Make a PUT request to send the cropped image data to the server
  axios
      .put(`/people/profile_image?id=${profileId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        //console.log('Image uploaded successfully:', response.data);
        // Reset the cropper and hide it
        showCropper.value = false;
        imgSrc.value = '';
        emit('imageCropperUploadedSuccess');
      })
      .catch((error) => {
        console.error('Error uploading image:', error);
      });
};

const handleDragEnter = (event) => {
  event.preventDefault();
  event.stopPropagation();
  // Add styles to indicate drag and drop area
  //console.log('got here in handle drag enter');
  if (dropZone.value)
    dropZone.value.classList.add('drag-over');

};

const handleDragLeave = (event) => {
  event.preventDefault();
  event.stopPropagation();
  // Remove styles from drag and drop area
  const isInsideDropZone = event.relatedTarget === dropZone.value || dropZone.value.contains(event.relatedTarget);

  if (!isInsideDropZone) {
    // Remove styles from drag and drop area
    if (dropZone.value) {
      dropZone.value.classList.remove('drag-over');
    }
  }
};

// Helper function to check if the cursor is inside the drop zone or its children
const isCursorInsideDropZone = (event) => {
  const rect = dropZone.value.getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;

  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
};

const handleDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();

  const files = event.dataTransfer.files;

  if (files.length > 0) {
    const file = files[0];
    if (file.type.startsWith('image/')) {
      imgSrc.value = URL.createObjectURL(file);
      showCropper.value = true;
    }
  }
}

const closeCropper = () => {
  //console.log('got here in close cropper')
  showCropper.value = false;
  imgSrc.value = '';
  emit('imageCropperCancelled');
};

onMounted(() => {
  // Attach the window click event listener
  window.addEventListener('mousedown', (event) => handleWindowClick(event));
});

onUnmounted(() => {
  // Remove the event listener when the component is unmounted
  window.removeEventListener('mousedown', (event) => handleWindowClick(event));
});

const handleWindowClick = (event) => {
  //console.log('got here in handle window click')
  if (showCropper.value) {
    //console.log('got here in if to close cropper')
    const cropperElement = cropper.value.$el;

    // Check if the clicked element is not inside the cropper area
    if (cropperElement && !cropperElement.contains(event.target) && !cropButton.contains(event.target)) {
      //console.log('closing. dont know why')
      closeCropper();
    }
  } else {
    //console.log('got here in else to close file input')
    const dropZoneEl = dropZone.value;
    //console.log(dropZoneEl);
    if(dropZoneEl && !dropZoneEl.contains(event.target)) {
      //console.log('got here in else to close file input and outside of dropZoneEl')
      closeCropper();
    }
  }
};
</script>

<template>
  <div>
    <div class="modal-overlay" v-if="showCropper"></div>

    <div
        v-if = "!showCropper"
        class="drop-zone"
        ref="dropZone"
        @dragenter="handleDragEnter"
        @dragover.prevent
        @dragleave="handleDragLeave"
        @drop="handleDrop"
        @click="handleClick"
    >
      <p>Drag & drop an image here or <br> click to select one</p>
      <input
          type="file"
          ref="fileInput"
          @change="handleFileChange"
          accept="image/*"
          class="hidden"
      />

      <!-- Hidden input element to trigger the file input dialog -->
      <input
          type="file"
          style="display: none;"
          ref="hiddenFileInput"
          @change="handleFileChange"
          accept="image/*"
      />

      <!-- Label element to open the hidden file input -->
      <label for="hiddenFileInput" style="display: none;"></label>
    </div>

    <div v-if="showCropper" class="relative" >
      <vue-cropper
          ref="cropper"
          :src="imgSrc"
          :view-mode="2"
          :aspectRatio="1"
          drag-mode="crop"
          alt="Selected Image"
          :img-style="{ width: '720px', height: '720px' }"
      ></vue-cropper>

      <div class="mt-2">
        <div class="flex items-center px-main-lr mb-10">
        <button ref="cropButton" @click="cropImage" tabindex="0"
                class="absolute bottom-4 right-4 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              class="text-white mr-2"
              stroke="#ffffff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
          >
            <path d="M6.13 1L6 16a2 2 0 002 2h15" />
            <path d="M1 6.13L16 6a2 2 0 012 2v15" />
          </svg>
        Crop & Upload</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drop-zone {
  border: 2px solid #ffffff;
  padding: 150px;
  text-align: center;
  color: white;
  cursor: pointer;
  background-color: slategray;
}

.drag-over {
  border: 2px solid #ffffff;
  padding: 150px;
  text-align: center;
  color: white;
  cursor: pointer;
  font-weight: bold;
  background-color: lightslategrey;
}

.drop-zone:focus {
  outline: 2px solid blue; /* Add a blue outline when focused */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  z-index: 9999; /* Ensure it's on top of other elements */
  display: none; /* Initially hidden */
}

.modal-overlay.active {
  display: block; /* Display when active */
}

</style>