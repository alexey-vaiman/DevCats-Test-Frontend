<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { apiClient } from '@/shared/api';
import VirtualScroller from '@/shared/ui/VirtualScroller.vue';
import type { ProductListItem } from '@/entities/product/model/types';

const items = ref<ProductListItem[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const nextCursor = ref<string | null>(null);
const scrollerRef = ref<InstanceType<typeof VirtualScroller> | null>(null);
const selectedIdx = ref(0);
const searchQuery = ref('');

const fetchProducts = async (reset = false) => {
  if (loading.value || (!hasMore.value && !reset)) return;
  
  loading.value = true;
  if (reset) {
    items.value = [];
    nextCursor.value = null;
    hasMore.value = true;
    selectedIdx.value = 0;
  }

  try {
    const response = await apiClient.get('public/products', {
      params: { 
        cursor: nextCursor.value,
        limit: 50,
        search: searchQuery.value || undefined
      }
    });
    
    const newItems = response.data.items;
    items.value = [...items.value, ...newItems];
    nextCursor.value = response.data.next_cursor;
    hasMore.value = !!nextCursor.value;
  } catch (error) {
    console.error('Failed to fetch products:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  fetchProducts(true);
};

const handleReset = () => {
  searchQuery.value = '';
  fetchProducts(true);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
    e.preventDefault();
    
    const step = 1;
    const pageStep = 10;
    
    if (e.key === 'ArrowDown') selectedIdx.value = Math.min(items.value.length - 1, selectedIdx.value + step);
    else if (e.key === 'ArrowUp') selectedIdx.value = Math.max(0, selectedIdx.value - step);
    else if (e.key === 'PageDown') selectedIdx.value = Math.min(items.value.length - 1, selectedIdx.value + pageStep);
    else if (e.key === 'PageUp') selectedIdx.value = Math.max(0, selectedIdx.value - pageStep);
    else if (e.key === 'Home') selectedIdx.value = 0;
    else if (e.key === 'End') selectedIdx.value = items.value.length - 1;
    
    scrollerRef.value?.scrollToIdx(selectedIdx.value);
  }
};

watch(searchQuery, (newVal) => {
  document.title = newVal ? `Search: ${newVal} | Marketplace` : 'Marketplace Catalog';
}, { immediate: true });

onMounted(() => {
  fetchProducts();
  window.addEventListener('keydown', handleKeydown);
  if (!searchQuery.value) document.title = 'Marketplace Catalog';
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="catalog">
    <div class="catalog-header">
      <div class="title-section">
        <h1>Marketplace Catalog</h1>
        <div class="stats">{{ items.length }} items loaded</div>
      </div>
      
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search products..." 
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch" class="search-btn">Search</button>
        <button @click="handleReset" class="reset-btn">Reset</button>
      </div>
    </div>
    
    <div class="scroller-container">
      <VirtualScroller
        ref="scrollerRef"
        :items="items"
        :item-height="280"
        :loading="loading"
        :has-more="hasMore"
        @load-more="fetchProducts"
      >
        <template #default="{ item, index }">
          <div 
            class="product-card" 
            :class="{ active: index === selectedIdx }"
          >
            <div class="card-content">
              <img :src="item.thumbnail_url || 'https://via.placeholder.com/200'" :alt="item.name" />
              <div class="details">
                <h3>{{ item.name }}</h3>
                <p class="price">{{ item.price.amount }} {{ item.price.currency }}</p>
                <div class="stock-badges">
                  <span v-if="item.stock > 0" class="badge-stock">In Stock ({{ item.stock }})</span>
                  <span v-else class="badge-out">Out of Stock</span>
                </div>
                <router-link :to="{ name: 'product-detail', params: { id: item.id } }" class="btn">
                  View Details
                </router-link>
              </div>
            </div>
          </div>
        </template>
        
        <template #loading>
          <div class="loading-spinner">Fetching more treasures...</div>
        </template>
      </VirtualScroller>
    </div>
  </div>
</template>

<style scoped>
.catalog {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 70px);
  padding: 0 2rem;
}
.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
}
.title-section h1 { margin: 0; }
.search-bar {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.search-bar input {
  background: none;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  width: 250px;
  outline: none;
}
.search-btn {
  background: #4facfe;
  color: white;
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  font-weight: 600;
}
.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #888;
  border-radius: 8px;
  padding: 0.5rem 1rem;
}
.stats {
  color: #888;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}
.scroller-container {
  flex: 1;
  min-height: 0; /* Important for flex child overflow */
}
.product-card {
  padding: 1rem;
  transition: opacity 0.2s;
}
.card-content {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  height: 100%;
}
.product-card.active .card-content {
  border-color: #4facfe;
  box-shadow: 0 0 15px rgba(79, 172, 254, 0.3);
  background: rgba(79, 172, 254, 0.05);
}
.product-card img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 12px;
}
.details {
  flex: 1;
}
.price {
  font-weight: bold;
  font-size: 1.5rem;
  color: #4facfe;
  margin: 0.5rem 0 1rem;
}
.stock-badges {
  margin-bottom: 1.5rem;
}
.badge-stock {
  background: rgba(79, 172, 254, 0.1);
  color: #4facfe;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}
.badge-out {
  background: rgba(255, 99, 132, 0.1);
  color: #ff6384;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}
.btn {
  display: inline-block;
  background: white;
  color: black;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
}
.loading-spinner {
  padding: 2rem;
  text-align: center;
  color: #4facfe;
  font-style: italic;
}
</style>
