<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <div v-if="error" class="error-banner">
      <div class="error-banner-text">
        {{ error }}
      </div>
    </div>
    <div class="logo py-3">
      <img src="@/assets/flocki_logo.jpg" alt="Flock Logo" class="w-24 h-24 rounded-full border-2" />
    </div>
    <div class="w-100 bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4">Church Setup Wizard</h2>
      <!-- Add description of this form -->
      <div class="pb-3"><p>Please enter details fo the church. This will be used throughout the  app. <br> You will be able to edit these details later on.</p></div>
      <form @submit="submitForm" class="space-y-4">
        <div class="form-group">
          <label for="name" class="block font-medium">Church Name:</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            required
            class="w-80 px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <!--label for="logo" class="block font-medium">Church Logo:</label>
          <input
            type="file"
            id="logo"
            ref="logoInput"
            accept="image/*"
          /-->
        <div class="form-group">
          <label for="website" class="block font-medium">Website:</label>
          <input
            type="url"
            id="website"
            v-model="formData.website"
            class="w-80 px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <label for="logo" class="block font-medium">Choose Logo: </label>
        <div
            class="border border-dashed border-gray-300 p-4 rounded-md "
            @dragover.prevent="preventDefault"
            @drop="handleDrop">
              <input
                type="file"
                id="logo"
                ref="logoInput"
                accept="image/*"
                class="w-full h-full opacity-0 cursor-pointer"
                @change="handleFileSelect"
              />

              <p class="text-gray-400 text-center absolute top-12 left-0 w-full h-full flex justify-center items-center pointer-events-none">
                  Drag and drop or click to upload a logo
              </p>              
              <img
                v-if="logoPreview"
                :src="logoPreview"
                alt="Uploaded Logo"
                class="mx-auto mt-4 max-w-xs"/>
        </div>
        <div class="form-group">
          <label for="email" class="block font-medium">Email:</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            class="w-80 px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div class="form-group">
          <label for="phone" class="block font-medium">Phone Number:</label>
          <input
            type="tel"
            id="phone"
            v-model="formData.phone"
            class="w-80 px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div class="form-group">
          <label for="description" class="block font-medium">Description:</label>
          <textarea
            id="description"
            v-model="formData.description"
            class="w-80 px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
          ></textarea>
        </div>
        <!-- Add more form fields for address_id, logo_image_id, etc., as needed -->

        <button  class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full" @click="handleButtonClick" :disabled="isLoading">
          {{ isLoading ? 'Creating...' : 'Create Church' }}
        </button>
      </form>
      </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router'

const router = useRouter()

function createChurch() {
  if (this.formData.logo_image_id == -1) {
    this.formData.logo_image_id = null;
  }
  axios.post('/church', this.formData)
      .then(response => {
        console.error("submit completed");
        if (response.status === 201 || response.status === 200) {
          // Church created successfully
          setTimeout(() => {
            // Navigate to the dashboard route after the delay
            this.isLoading = false;
            this.$router.push({name: 'dashboard'});
          }, 2000); // 2000 milliseconds = 2 seconds
        } else {
          console.log("error creating church");
          this.error = 'Failed to create church.';
          //display error banner for 2 seconds and redirect user to dashboard
          setTimeout(() => {
            // Navigate to the dashboard route after the delay
            this.isLoading = false;
            this.error = null;
            this.$router.push({name: 'dashboard'});
          }, 3000); // 3000 milliseconds = 3 seconds
        }
      })
      .catch(error => {
        console.error(error);
        //this is a bit of a hack
        if (error.response != null && error.response.data != null && error.response.data.detail == "Church has already been defined. You can only update the existing record.") {
          this.error = 'A church has already been defined. You can only update the existing record.';
        } else {
          this.error = 'An error occurred while creating the church.';
        }
        this.isLoading = false;
        setTimeout(() => {
          // Navigate to the dashboard route after the delay
          this.isLoading = false;
          this.error = null;
          this.$router.push({name: 'dashboard'});
        }, 3000); // 3000 milliseconds = 3 seconds
      })
}

export default {
  data() {
    return {
      formData: {
        name: '',
        website: '',
        email: '',
        phone: '',
        description: '',
        logo_image_id: -1, //this will fail if not overwritten
        // Add more fields for address_id, logo_image_id, etc.\
      },
      error: null,
      isLoading: false,
      logoPreview: null,
      file: null,
    };
  },
  methods: {
    handleButtonClick(event) {
      event.preventDefault()
      this.isLoading = true;
      try {
          //const file = this.$refs.logoInput.files[0]; // Get the selected file
      
          // Create a FormData object to send the file to the server
          if (this.file != null) {
            const fd = new FormData();
            fd.append('file', this.file);
            axios.post('/image', fd, {
              headers: {
                'Content-Type': 'multipart/form-data', // Set the content type for file upload
              },
            }).then(response => {
                  this.formData.logo_image_id=response.data.id;
                  // Send a POST request to create the church
                  createChurch.call(this);
            }).catch(error => {
              console.error('Error uploading logo:', error);
            });
          } else {
            createChurch.call(this);
          }

      } catch (error) {
          console.error(error);
      }
    },
 
    handleFileSelect(event) {
      console.log('Got here in handleFileSelect')
      this.file = event.target.files[0];
      this.previewImage(this.file);
    },

    handleDrop(event) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      this.file = file;
      this.previewImage(file);
    },

    preventDefault(event) {
      event.preventDefault();
    },

    previewImage(file) {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.logoPreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
  }
};
</script>
<style scoped>
.error-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #ac2121; /* Choose your desired background color */
  color: white; /* Choose your desired text color */
  text-align: center;
  padding: 10px; /* Adjust padding as needed */
}

.error-banner-text {
  /* Center text vertically and horizontally within the error banner */
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>