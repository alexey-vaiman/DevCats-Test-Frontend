<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, ExternalLink } from 'lucide-vue-next';
import apiClient from '../api';

interface Props {
  seller: any;
  show: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

const offers = ref<any[]>([]);
const loading = ref(false);

const fetchOffers = async () => {
  if (!props.seller) return;
  loading.value = true;
  try {
    const response = await apiClient.get(`admin/sellers/${props.seller.id}/offers`);
    offers.value = response.data;
  } catch (err) {
    console.error('Failed to fetch seller offers');
  } finally {
    loading.value = false;
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) fetchOffers();
});
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div>
          <h2>Offers by {{ seller?.name }}</h2>
          <p class="subtitle">Listing {{ offers.length }} active offers</p>
        </div>
        <button @click="emit('close')" class="close-btn"><X /></button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading">Loading inventory...</div>
        <div v-else-if="offers.length === 0" class="empty">This seller has no active offers.</div>
        <div v-else class="offers-grid">
          <div v-for="offer in offers" :key="offer.id" class="offer-card">
            <div class="offer-header">
              <span class="product-name">{{ offer.product?.name || 'Unknown Product' }}</span>
              <router-link :to="{ name: 'product-detail', params: { id: offer.product_id } }" class="link">
                <ExternalLink class="xs-icon" />
              </router-link>
            </div>
            <div class="offer-details">
              <div class="price">{{ offer.price.amount }} {{ offer.price.currency }}</div>
              <div class="delivery">Delivers by: {{ offer.delivery_date }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
.modal {
  background: #1a1a1a;
  padding: 2rem;
  border-radius: 24px;
  width: 100%;
  max-width: 700px;
  border: 1px solid rgba(255,255,255,0.1);
  max-height: 80vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}
.subtitle { color: #888; font-size: 0.9rem; margin-top: 0.25rem; }
.close-btn { background: none; border: none; color: #888; }
.offers-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.offer-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 1rem;
}
.offer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.product-name { font-weight: 600; color: #4facfe; }
.price { font-size: 1.2rem; font-weight: bold; margin: 0.25rem 0; }
.delivery { font-size: 0.8rem; color: #666; }
.xs-icon { width: 14px; height: 14px; }
.link { color: #888; }
.loading, .empty { text-align: center; padding: 3rem; color: #888; }
</style>
