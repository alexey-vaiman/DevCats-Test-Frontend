<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

interface Props {
  items: any[];
  itemHeight: number;
  bufferSize?: number;
  loading: boolean;
  hasMore: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  bufferSize: 20
});

const emit = defineEmits(['load-more', 'update:visibleIndices']);

const containerRef = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const viewportHeight = ref(0);

// Calculate which indices should be rendered
const visibleRange = computed(() => {
  const startIdx = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.bufferSize);
  const endIdx = Math.min(
    props.items.length,
    Math.ceil((scrollTop.value + viewportHeight.value) / props.itemHeight) + props.bufferSize
  );
  return { start: startIdx, end: endIdx };
});

const visibleItems = computed(() => {
  return props.items.slice(visibleRange.value.start, visibleRange.value.end).map((item, index) => ({
    ...item,
    _virtualIdx: visibleRange.value.start + index
  }));
});

// Total height of the scrollable area
const totalHeight = computed(() => props.items.length * props.itemHeight);

// Offset for the visible window
const offsetY = computed(() => visibleRange.value.start * props.itemHeight);

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  scrollTop.value = target.scrollTop;
  
  // Trigger load more when reaching near the bottom
  if (props.hasMore && !props.loading) {
    const bottomDist = target.scrollHeight - (target.scrollTop + target.clientHeight);
    if (bottomDist < 500) { // Trigger 500px before end
      emit('load-more');
    }
  }
};

const handleResize = () => {
  if (containerRef.value) {
    viewportHeight.value = containerRef.value.clientHeight;
  }
};

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// Expose scroll method for keyboard navigation
const scrollToIdx = (idx: number) => {
  if (containerRef.value) {
    containerRef.value.scrollTop = idx * props.itemHeight;
  }
};

defineExpose({ scrollToIdx });
</script>

<template>
  <div 
    ref="containerRef" 
    class="virtual-scroller" 
    @scroll="handleScroll"
  >
    <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
      <div 
        class="visible-window"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div 
          v-for="item in visibleItems" 
          :key="item.id"
          class="scroller-item"
          :style="{ height: `${itemHeight}px` }"
        >
          <slot :item="item" :index="item._virtualIdx"></slot>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="scroller-loading">
      <slot name="loading">Loading more items...</slot>
    </div>
  </div>
</template>

<style scoped>
.virtual-scroller {
  height: 100%;
  overflow-y: auto;
  position: relative;
  will-change: transform;
}

.visible-window {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.scroller-item {
  width: 100%;
  overflow: hidden;
}

.scroller-loading {
  padding: 1rem;
  text-align: center;
  color: #888;
}
</style>
