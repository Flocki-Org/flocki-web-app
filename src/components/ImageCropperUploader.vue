<script setup>
import {computed, ref, watch, defineEmits , inject} from 'vue';
import cropperModule from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';

// The package is CommonJS. Vite sometimes hands the module object through,
// so the template ref is not the component and crop methods are missing.
const VueCropper = cropperModule.render ? cropperModule : cropperModule.default

const dropZone = ref(null);
const showCropper = ref(false);
const imageUploadWrapper = ref(null);
const imgSrc = ref('');
const isUploading = ref(false); // Add a loading state variable

const cropper = ref(null);
const cropButton = ref(null);
const props = defineProps({
  showImageCropper: { type: Boolean, default: false },
  uploadEndpoint: { type: String, default: '' },
  aspectRatio: { type: Number, default: 1 },
  initialImageUrl: { type: String, default: '' },
})
const isPreparing = ref(false)
const cropperStyle = computed(() => {
  const width = 560
  const height = Math.round(width / (props.aspectRatio || 1))
  return { width: `${width}px`, height: `${height}px` }
})
const emit = defineEmits(['imageCropperUploadFailed', 'imageCropperCancelled', 'imageCropperUploadedSuccess']);
const axios = inject('axios')

const loadInitialImage = async (url) => {
  if (!url) return
  isPreparing.value = true
  try {
    const response = await axios.get(url, { responseType: 'blob' })
    if (imgSrc.value.startsWith('blob:')) URL.revokeObjectURL(imgSrc.value)
    imgSrc.value = URL.createObjectURL(response.data)
    showCropper.value = true
  } catch (error) {
    console.error('Could not open that photo', error)
    emit('imageCropperUploadFailed')
  } finally {
    isPreparing.value = false
  }
}

watch(() => props.initialImageUrl, (url) => {
  if (url) loadInitialImage(url)
}, { immediate: true })

const handleFileChange = (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  imgSrc.value = URL.createObjectURL(file);
  showCropper.value = true;
  event.target.value = '';
};

const cropImage = () => {
  // Get the cropped image data
  const croppedData = cropper.value.getCroppedCanvas().toDataURL('image/jpeg');
  //console.log(croppedData);
  // You can send `croppedData` to your server or perform other actions with it

  // Reset the cropper and hide it
  showCropper.value = false;
  imgSrc.value = '';
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

  isUploading.value = true;
  // Make a PUT request to send the cropped image data to the server
  axios
      .put(props.uploadEndpoint, formData)
      .then((response) => {
        //console.log('Image uploaded successfully:', response.data);
        // Reset the cropper and hide it
        showCropper.value = false;
        isUploading.value = false;
        imgSrc.value = '';
        emit('imageCropperUploadedSuccess');
      })
      .catch((error) => {
        isUploading.value = false;
        showCropper.value = false;
        console.error('Error uploading image:', error);
        emit('imageCropperUploadFailed');
      });
};

const cancelCrop = () => {
  emit('imageCropperCancelled');
}

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

const closeUploader = () => {
  showCropper.value = false;
  imgSrc.value = '';
  emit('imageCropperCancelled');
};

</script>

<template>
  <div>
    <div class="modal-overlay" v-if="showCropper"></div>
    <div v-if="isUploading" class="spinner-overlay">
      <div class="spinner-border text-primary" role="status">
        <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div class="image-uploader-wrapper" ref="imageUploadWrapper">
      <div class="mb-2 flex justify-end">
        <button type="button" class="text-sm text-gray-500 hover:text-gray-800" @click="closeUploader">Close</button>
      </div>
      <p v-if="isPreparing" class="py-16 text-center text-sm text-gray-500">Loading the household photo…</p>
      <div
          v-if = "!showCropper && !isUploading && !isPreparing"
          class="drop-zone"
          ref="dropZone"
          @dragenter="handleDragEnter"
          @dragover.prevent
          @dragleave="handleDragLeave"
          @drop="handleDrop"
      >
        <input
            id="image-cropper-file"
            type="file"
            accept="image/*"
            class="file-picker"
            @change="handleFileChange"
        />
        <label for="image-cropper-file" class="drop-zone-label">
        <div class="flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="text-white mr-2" width="80" height="80" viewBox="0 0 80 80" fill="none"
               stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M70 50v13.333a6.667 6.667 0 0 1 -6.667 6.667H16.667a6.667 6.667 0 0 1 -6.667 -6.667v-13.333"/>
            <path points="17 8 12 3 7 8" d="M56.667 26.667L40 10L23.333 26.667"/>
            <path x1="12" y1="3" x2="12" y2="15" d="M40 10L40 50"/>
          </svg>

        </div>
        <p>Drag &amp; drop an image here or <br> click to select one</p>
        </label>
      </div>

      <div v-if="showCropper && !isUploading" class="relative" >
        <vue-cropper
            ref="cropper"
            :src="imgSrc"
            :view-mode="2"
            :aspectRatio="props.aspectRatio"
            drag-mode="crop"
            alt="Selected Image"
            :img-style="cropperStyle"
        ></vue-cropper>
      </div>
      <div class="mt-2" v-if="showCropper && !isUploading">
        <div class="flex items-center justify-end space-x-2">
          <button
              ref="cancelButton"
              @click="cancelCrop"
              tabindex="0"
              class="px-4 py-2 rounded-lg bg-gray-300 text-black hover:bg-gray-400 flex items-center"
          >
            Cancel
          </button>
          <button ref="cropButton" @click="cropImage" tabindex="0"
                  class="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center">
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
.spinner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7); /* Semi-transparent white background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999; /* Ensure it's on top of other elements */
}

.image-uploader-wrapper {
  border: 2px solid #ccc;
  padding: 1rem;
  width: min(100%, 600px);
  max-height: min(90vh, 680px);
  overflow: auto;
  border-radius: 10px;
  background-color: #f9f9f9;
  box-sizing: border-box;
}
.drop-zone {
  position: relative;
  display: block;
  border: 2px dashed lightslategrey;
  text-align: center;
  color: black;
  cursor: pointer;
  background-color: white;
}

.drop-zone-label {
  display: block;
  padding: clamp(2rem, 8vw, 100px);
  cursor: pointer;
}

.file-picker {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.drag-over {
  border: 4px solid #a4b8ed;
  text-align: center;
  color: black;
  cursor: pointer;
  background-color: #edf2ff;
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