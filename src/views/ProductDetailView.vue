<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '../api';
import { Truck, ShieldCheck } from 'lucide-vue-next';

const route = useRoute();
const product = ref<any>(null);
const loading = ref(true);
const offersSort = ref('price');

const fetchProduct = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(`public/products/${route.params.id}`, {
      params: { offers_sort: offersSort.value }
    });
    product.value = response.data;
  } catch (err) {
    console.error('Failed to fetch product:', err);
  } finally {
    loading.value = false;
  }
};

watch(() => product.value?.name, (newVal) => {
  if (newVal) document.title = `${newVal} | Marketplace`;
}, { immediate: true });

onMounted(fetchProduct);
</script>

<template>
  <div class="product-detail">
    <div v-if="loading" class="loading">Loading product...</div>
    <div v-else-if="product" class="content">
      <div class="product-header">
        <div class="image-section">
          <img :src="product.image_url || 'https://via.placeholder.com/600'" :alt="product.name" />
        </div>
        <div class="info-section">
          <div class="badges">
            <span v-if="product.stock > 0" class="badge-stock">In Stock ({{ product.stock }})</span>
            <span v-else class="badge-out">Out of Stock</span>
          </div>
          <h1>{{ product.name }}</h1>
          
          <div class="attributes">
            <div v-for="attr in product.attributes" :key="attr.key" class="attr-chip">
              <span class="attr-key">{{ attr.key }}:</span> {{ attr.value }}
            </div>
          </div>

          <div class="offers-section">
            <div class="offers-header">
              <h2>Available Offers</h2>
              <select v-model="offersSort" @change="fetchProduct" class="sort-select">
                <option value="price">Sort by Price</option>
                <option value="delivery_date">Sort by Delivery</option>
              </select>
            </div>
            
            <div class="offers-list">
              <div v-for="offer in product.offers" :key="offer.id" class="offer-card">
                <div class="seller-info">
                  <div class="seller-name"><ShieldCheck class="icon" /> {{ offer.seller.name }}</div>
                  <div class="seller-rating">Rating: {{ offer.seller.rating }}/5</div>
                </div>
                <div class="offer-details">
                  <div class="offer-price">{{ offer.price.amount }} {{ offer.price.currency }}</div>
                  <div class="offer-delivery"><Truck class="icon" /> Delivers by {{ offer.delivery_date }}</div>
                </div>
                <button class="buy-btn">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-detail {
  padding: 3rem 2rem;
}
.product-header {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 4rem;
}
.image-section img {
  width: 100%;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}
.info-section h1 {
  font-size: 3rem;
  margin: 1rem 0 2rem;
  text-align: left;
}
.badges {
  display: flex;
  gap: 1rem;
}
.badge-stock {
  background: rgba(79, 172, 254, 0.1);
  color: #4facfe;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}
.badge-out {
  background: rgba(255, 99, 132, 0.1);
  color: #ff6384;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}
.attr-chip {
  display: inline-block;
  background: rgba(255,255,255,0.05);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin-right: 0.75rem;
  margin-bottom: 0.75rem;
}
.attr-key {
  color: #888;
}
.offers-section {
  margin-top: 3rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 2rem;
}
.offers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.sort-select {
  background: #1a1a1a;
  color: white;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
}
.offer-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.seller-name {
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.icon {
  width: 18px;
  height: 18px;
  color: #4facfe;
}
.seller-rating {
  font-size: 0.85rem;
  color: #888;
  margin-top: 0.25rem;
}
.offer-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
}
.offer-delivery {
  font-size: 0.9rem;
  color: #888;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.25rem;
}
.buy-btn {
  background: white;
  color: black;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
}
</style>
