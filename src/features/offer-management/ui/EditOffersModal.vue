<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, Plus, Trash2, Save } from 'lucide-vue-next';
import { apiClient } from '@/shared/api';

interface Props {
  productId: string;
  show: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

const offers = ref<any[]>([]);
const sellers = ref<any[]>([]);
const loading = ref(false);

const newOffer = ref({
  seller_id: '',
  price: { amount: 0, currency: 'USD' },
  delivery_date: new Date().toISOString().split('T')[0]
});

const fetchSellers = async () => {
  try {
    const response = await apiClient.get('admin/sellers');
    sellers.value = response.data;
  } catch (err) {
    console.error('Failed to fetch sellers');
  }
};

const fetchOffers = async () => {
  if (!props.productId) return;
  loading.value = true;
  try {
    const response = await apiClient.get(`admin/products/${props.productId}/offers`);
    offers.value = response.data;
  } catch (err) {
    console.error('Failed to fetch offers');
  } finally {
    loading.value = false;
  }
};

watch(() => props.productId, (newVal) => {
  if (newVal && props.show) {
    fetchOffers();
  }
}, { immediate: true });

watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchSellers();
    fetchOffers();
  }
});

const handleAddOffer = async () => {
  if (!newOffer.value.seller_id) return alert('Select a seller');
  try {
    await apiClient.post(`admin/products/${props.productId}/offers`, newOffer.value);
    newOffer.value = {
      seller_id: '',
      price: { amount: 0, currency: 'USD' },
      delivery_date: new Date().toISOString().split('T')[0]
    };
    fetchOffers();
  } catch (err) {
    alert('Failed to add offer');
  }
};

const handleDelete = async (offerId: string) => {
  if (!confirm('Delete this offer?')) return;
  try {
    await apiClient.delete(`admin/offers/${offerId}`);
    fetchOffers();
  } catch (err) {
    alert('Failed to delete offer');
  }
};

// Simplified: inline update for price only for now to keep UI clean
const handleUpdatePrice = async (offer: any) => {
  try {
    await apiClient.put(`admin/offers/${offer.id}`, {
      seller_id: offer.seller_id,
      price: offer.price,
      delivery_date: offer.delivery_date
    });
    alert('Offer updated');
  } catch (err) {
    alert('Failed to update offer');
  }
};
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Manage Offers</h2>
        <button @click="emit('close')" class="close-btn"><X /></button>
      </div>

      <div class="modal-body">
        <!-- Add New Offer Section -->
        <div class="add-section">
          <h3>Add New Offer</h3>
          <div class="add-form">
            <select v-model="newOffer.seller_id">
              <option value="" disabled>Select Seller</option>
              <option v-for="s in sellers" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <input v-model.number="newOffer.price.amount" type="number" placeholder="Price" />
            <input v-model="newOffer.delivery_date" type="date" />
            <button @click="handleAddOffer" class="add-btn"><Plus /> Add</button>
          </div>
        </div>

        <div class="offers-list">
          <div v-if="loading" class="loading">Loading offers...</div>
          <table v-else class="offer-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Price</th>
                <th>Delivery</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="offer in offers" :key="offer.id">
                <td>{{ sellers.find(s => s.id === offer.seller_id)?.name || 'Unknown' }}</td>
                <td>
                  <input v-model.number="offer.price.amount" type="number" class="inline-input" />
                </td>
                <td>
                  <input v-model="offer.delivery_date" type="date" class="inline-input" />
                </td>
                <td class="actions">
                  <button @click="handleUpdatePrice(offer)" title="Save"><Save class="sm-icon" /></button>
                  <button @click="handleDelete(offer.id)" class="del-btn"><Trash2 class="sm-icon" /></button>
                </td>
              </tr>
            </tbody>
          </table>
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
  border-radius: 20px;
  width: 100%;
  max-width: 800px;
  border: 1px solid rgba(255,255,255,0.1);
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.close-btn { background: none; border: none; color: #888; }
.add-section {
  background: rgba(255,255,255,0.05);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}
.add-form {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
.add-form select, .add-form input {
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  background: #000;
  border: 1px solid #333;
  color: white;
}
.add-btn { background: #4facfe; color: white; padding: 0.5rem 1rem; border-radius: 8px; }
.offer-table {
  width: 100%;
  border-collapse: collapse;
}
.offer-table th, .offer-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #333;
}
.inline-input {
  width: 100%;
  background: transparent;
  border: 1px solid #333;
  color: white;
  padding: 0.25rem;
  border-radius: 4px;
}
.actions { display: flex; gap: 0.5rem; }
.actions button { padding: 0.4rem; background: rgba(255,255,255,0.05); border-radius: 4px; }
.sm-icon { width: 14px; height: 14px; }
.del-btn { color: #ff4d4f; }
.loading { text-align: center; padding: 2rem; color: #888; }
</style>
