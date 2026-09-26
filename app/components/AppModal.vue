<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  labelledBy: string
  closeOnBackdrop?: boolean
  inert?: boolean
}>(), {
  closeOnBackdrop: true,
  inert: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')

function syncDialog(open: boolean): void {
  const element = dialog.value
  if (!element) return

  if (open && !element.open) {
    element.showModal()
  }
  else if (!open && element.open) {
    element.close()
  }
}

function requestClose(): void {
  emit('update:modelValue', false)
}

function handleBackdropClick(event: MouseEvent): void {
  if (props.closeOnBackdrop && event.target === dialog.value) {
    requestClose()
  }
}

watch(() => props.modelValue, value => nextTick(() => syncDialog(value)))
onMounted(() => syncDialog(props.modelValue))
onBeforeUnmount(() => {
  if (dialog.value?.open) dialog.value.close()
})
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      class="app-modal"
      :aria-labelledby="labelledBy"
      :inert="inert"
      @cancel.prevent="requestClose"
      @close="requestClose"
      @click="handleBackdropClick"
    >
      <div class="app-modal__panel">
        <div class="app-modal__accent" aria-hidden="true" />
        <header class="app-modal__header">
          <div>
            <p class="eyebrow">Captured Pokémon</p>
            <h2 :id="labelledBy">{{ title }}</h2>
          </div>
          <button class="icon-button" type="button" aria-label="Close modal" @click="requestClose">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div class="app-modal__body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="app-modal__footer">
          <slot name="footer" />
        </footer>
      </div>
    </dialog>
  </Teleport>
</template>
