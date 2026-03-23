<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Trash2, Edit3, Package } from 'lucide-vue-next';
import { apiClient } from '@/shared/api';
import SellerEditModal from '@/features/seller-management/ui/SellerEditModal.vue';
import SellerOffersModal from '@/features/seller-management/ui/SellerOffersModal.vue';
import type { Seller } from '@/entities/product/model/types';

const sellers = ref<Seller[]>([]);
const loading = ref(false);

const showSellerModal = ref(false);
const showSellerOffersModal = ref(false);
const selectedSeller = ref<Seller | null>(null);

const fetchSellers = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('admin/sellers');
    sellers.value = response.data;
  } catch (err) { console.error(err); } finally { loading.value = false; }
};

const handleCreateSellerTrigger = () => {
  selectedSeller.value = null;
  showSellerModal.value = true;
};

const handleEditSeller = (seller: Seller) => {
  selectedSeller.value = seller;
  showSellerModal.value = true;
};

const handleShowOffers = (seller: Seller) => {
  selectedSeller.value = seller;
  showSellerOffersModal.value = true;
};

const handleDeleteSeller = async (id: string) => {
  if (!confirm('Delete seller?')) return;
  try {
    await apiClient.delete(`admin/sellers/${id}`);
    fetchSellers();
  } catch (err) { alert('Failed to delete seller. Make sure they have no offers left.'); }
};

onMounted(fetchSellers);
</script>

<template>
  <div class="header-actions">
    <button @click="handleCreateSellerTrigger" class="add-btn">
      <Plus /> Create Seller
    </button>
  </div>

  <div class="admin-table-container">
    <div class="table-header">
      <div class="col col-name">Seller Name</div>
      <div class="col col-desc">Description</div>
      <div class="col col-actions">Actions</div>
    </div>
    <div class="scroller-wrapper">
      <div v-for="seller in sellers" :key="seller.id" class="table-row">
        <div class="col col-name">
          <div class="seller-info">
            <strong>{{ seller.name }}</strong>
            <span class="rating">⭐ {{ seller.rating }}</span>
          </div>
        </div>
        <div class="col col-desc truncate">{{ seller.description || 'No description' }}</div>
        <div class="col col-actions">
          <div class="actions">
            <button @click="handleEditSeller(seller)" title="Edit"><Edit3 class="sm-icon" /></button>
            <button @click="handleShowOffers(seller)" title="View Inventory"><Package class="sm-icon" /></button>
            <button @click="handleDeleteSeller(seller.id)" class="delete-btn"><Trash2 class="sm-icon" /></button>
          </div>
        </div>
      </div>
      <div v-if="sellers.length === 0" class="empty-msg">No sellers found.</div>
    </div>
  </div>

  <SellerEditModal
    :show="showSellerModal"
    :seller="selectedSeller"
    @close="showSellerModal = false"
    @updated="fetchSellers"
  />
  <SellerOffersModal
    :show="showSellerOffersModal"
    :seller="selectedSeller"
    @close="showSellerOffersModal = false"
  />
</template>

<style scoped>
.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}
.add-btn {
  background: #4facfe;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
}
.admin-table-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.table-header {
  display: flex;
  background: rgba(255,255,255,0.05);
  padding: 1rem 1.5rem;
  font-weight: bold;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  flex-shrink: 0;
}
.table-row {
  display: flex;
  padding: 0 1.5rem;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  height: 70px;
  flex-shrink: 0;
}
.col { flex: 1; padding: 0.5rem; }
.col-name { flex: 3; }
.col-desc { flex: 2; color: #888; }
.col-actions { flex: 1.5; }
.seller-info { display: flex; flex-direction: column; }
.rating { font-size: 0.8rem; color: #ffca28; }
.scroller-wrapper {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
.actions button {
  padding: 0.5rem;
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: white;
}
.delete-btn { color: #ff4d4f; }
.sm-icon { width: 16px; height: 16px; }
.empty-msg { padding: 2rem; text-align: center; color: #555; font-style: italic; }
</style>
