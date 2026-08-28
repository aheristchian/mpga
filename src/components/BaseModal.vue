<template>
  <!-- Teleport moves this HTML to the <body> tag, ensuring it always overlays the whole page 
       regardless of how deeply nested the component is in your Vue tree -->
  <Teleport to="body">
    <!-- Transition adds fade/scale animations when v-if changes -->
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden"
      >
        <!-- Backdrop (Clicking it closes the modal) -->
        <div
          class="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          @click="closeModal"
        ></div>

        <!-- Modal Panel with Viewport Height Constraints -->
        <div
          class="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-h-[90vh] flex flex-col overflow-hidden transform transition-all z-10"
          :class="maxWidth"
        >
          <!-- Header (Sticky / Shrink-0) -->
          <div
            class="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/95 backdrop-blur-sm shrink-0"
          >
            <h3 class="text-xl font-bold text-white">
              <!-- SLOT: Allows parent to pass in custom title -->
              <slot name="title">{{ title }}</slot>
            </h3>
            <button
              class="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700"
              @click="closeModal"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Body (Scrollable with min-h-0) -->
          <div class="px-6 py-5 text-gray-300 flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <!-- DEFAULT SLOT: This is where the main content goes -->
            <slot>
              <p>Default modal content. Pass something into the slot!</p>
            </slot>
          </div>

          <!-- Footer / Actions (Sticky / Shrink-0) -->
          <div
            class="px-6 py-4 border-t border-gray-700 bg-gray-800/95 backdrop-blur-sm shrink-0 flex justify-end gap-3"
          >
            <!-- FOOTER SLOT: For custom buttons. Falls back to a default "Close" button -->
            <slot name="footer">
              <button
                class="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                @click="closeModal"
              >
                Close
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

// Define the inputs this component accepts
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Notice',
  },
  maxWidth: {
    type: String,
    default: 'max-w-lg',
  },
});

// Define the events this component can send out
const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

// --- Advanced Polish: Escape Key Listener ---
const handleEscape = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
/* Vue <Transition> classes for the "modal" name we defined above */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Target the inner panel to make it pop/scale */
.modal-enter-active .transform,
.modal-leave-active .transform {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .transform,
.modal-leave-to .transform {
  transform: scale(0.95) translateY(10px);
}
</style>
