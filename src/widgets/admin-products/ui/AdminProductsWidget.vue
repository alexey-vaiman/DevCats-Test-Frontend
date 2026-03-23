<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Trash2, Edit3, Image as ImageIcon, Tag, Search, RotateCcw } from 'lucide-vue-next';
import { apiClient } from '@/shared/api';
import VirtualScroller from '@/shared/ui/VirtualScroller.vue';
import EditProductModal from '@/features/product-management/ui/EditProductModal.vue';
import EditOffersModal from '@/features/offer-management/ui/EditOffersModal.vue';
import type { ProductListItem, ProductDetails } from '@/entities/product/model/types';

const products = ref<ProductListItem[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const nextCursor = ref(null);
const productSearchQuery = ref('');

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showOffersModal = ref(false);
const selectedProduct = ref<ProductDetails | null>(null);

const newProduct = ref({
  name: '',
  price: { amount: 0, currency: 'USD' },
  stock: 0,
  attributes: [] as { key: string, value: string }[]
});

const fetchProducts = async (reset = false) => {
  if (loading.value || (!hasMore.value && !reset)) return;
  loading.value = true;
  if (reset) { products.value = []; nextCursor.value = null; hasMore.value = true; }
  try {
    const response = await apiClient.get('admin/products', {
      params: { 
        cursor: nextCursor.value, 
        limit: 50,
        search: productSearchQuery.value || undefined
      }
    });
    products.value = [...products.value, ...response.data.items];
    nextCursor.value = response.data.next_cursor;
    hasMore.value = !!nextCursor.value;
  } catch (err) { console.error(err); } finally { loading.value = false; }
};

const handleProductSearch = () => fetchProducts(true);
const handleProductReset = () => { productSearchQuery.value = ''; fetchProducts(true); };

const handleEdit = (product: ProductListItem) => { selectedProduct.value = product as unknown as ProductDetails; showEditModal.value = true; };
const handleManageOffers = (product: ProductListItem) => { selectedProduct.value = product as unknown as ProductDetails; showOffersModal.value = true; };
const handleDelete = async (id: string) => {
  if (!confirm('Delete product?')) return;
  try {
    await apiClient.delete(`admin/products/${id}`);
    fetchProducts(true);
  } catch (err) { alert('Failed'); }
};

const handleCreateProduct = async () => {
  try {
    await apiClient.post('admin/products', newProduct.value);
    showCreateModal.value = false;
    newProduct.value = { name: '', price: { amount: 0, currency: 'USD' }, stock: 0, attributes: [] as { key: string, value: string }[] };
    fetchProducts(true);
  } catch (err) { alert('Failed'); }
};

onMounted(() => fetchProducts(true));
</script>

<template>
  <div class="header-actions">
    <button @click="showCreateModal = true" class="add-btn">
      <Plus /> Create Product
    </button>
  </div>

  <div class="admin-table-container">
    <div class="table-header search-enabled">
      <div class="header-main">
        <div class="col col-name">Name</div>
        <div class="col col-stock">Stock</div>
        <div class="col col-price">Price</div>
        <div class="col col-actions">Actions</div>
      </div>
      <div class="table-search">
        <div class="search-input-wrapper">
          <Search class="search-icon-inline" />
          <input 
            v-model="productSearchQuery" 
            type="text" 
            placeholder="Filter products..." 
            @keyup.enter="handleProductSearch"
          />
        </div>
        <button @click="handleProductSearch" class="search-btn-flat">Search</button>
        <button @click="handleProductReset" class="reset-btn-flat" title="Reset"><RotateCcw class="sm-icon" /></button>
      </div>
    </div>
    <div class="scroller-wrapper">
      <VirtualScroller
        :items="products"
        :item-height="70"
        :loading="loading"
        :has-more="hasMore"
        @load-more="fetchProducts(false)"
      >
        <template #default="{ item }">
          <div class="table-row">
            <div class="col col-name">
              <div class="product-cell">
                <img v-if="item.thumbnail_url" :src="item.thumbnail_url" class="thumb" />
                <ImageIcon v-else class="thumb dark-placeholder" />
                <span class="truncate">{{ item.name }}</span>
              </div>
            </div>
            <div class="col col-stock">{{ item.stock }}</div>
            <div class="col col-price">{{ item.price.amount }} {{ item.price.currency }}</div>
            <div class="col col-actions">
              <div class="actions">
                <button @click="handleEdit(item)" title="Edit"><Edit3 class="sm-icon" /></button>
                <button @click="handleManageOffers(item)" title="Offers"><Tag class="sm-icon" /></button>
                <button @click="handleDelete(item.id)" class="delete-btn"><Trash2 class="sm-icon" /></button>
              </div>
            </div>
          </div>
        </template>
      </VirtualScroller>
    </div>
  </div>

  <!-- Create Modal -->
  <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
    <div class="modal">
      <h2>New Product</h2>
      <div class="form-group">
        <label>Name</label>
        <input v-model="newProduct.name" type="text" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Price</label>
          <input v-model.number="newProduct.price.amount" type="number" />
        </div>
        <div class="form-group">
          <label>Stock</label>
          <input v-model.number="newProduct.stock" type="number" />
        </div>
      </div>
      <div class="modal-actions">
        <button @click="showCreateModal = false" class="cancel-btn">Cancel</button>
        <button @click="handleCreateProduct" class="save-btn">Create</button>
      </div>
    </div>
  </div>

  <EditProductModal 
    :show="showEditModal" 
    :product="selectedProduct"
    @close="showEditModal = false"
    @updated="fetchProducts(true)"
  />

  <EditOffersModal
    :show="showOffersModal"
    :productId="selectedProduct?.id || ''"
    @close="showOffersModal = false"
  />
</template>

<style scoped>
/* Copied styles specific to this widget */
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
  font-weight: bold;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  flex-shrink: 0;
  flex-direction: column;
}
.header-main {
  display: flex;
  padding: 1rem 1.5rem;
  width: 100%;
}
.table-search {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(0,0,0,0.2);
  border-top: 1px solid rgba(255,255,255,0.05);
  align-items: center;
}
.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: #000;
  border-radius: 8px;
  border: 1px solid #333;
  padding: 0 0.75rem;
}
.search-icon-inline { width: 14px; height: 14px; color: #555; }
.search-input-wrapper input {
  background: none;
  border: none;
  color: white;
  padding: 0.5rem;
  flex: 1;
  outline: none;
  font-size: 0.9rem;
}
.search-btn-flat {
  background: #4facfe;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
}
.reset-btn-flat {
  padding: 0.5rem;
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
  color: #888;
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
.col-actions { flex: 1.5; }
.scroller-wrapper {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.product-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
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
}
.delete-btn { color: #ff4d4f; }
.sm-icon { width: 16px; height: 16px; }
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background: #1a1a1a;
  padding: 2rem;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255,255,255,0.1);
}
.modal h2 { margin-bottom: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #888; }
.form-group input { 
  width: 100%; padding: 0.75rem; border-radius: 8px; 
  background: #000; border: 1px solid #333; color: white;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
.save-btn { background: #4facfe; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: bold; cursor: pointer; }
.cancel-btn { background: transparent; color: #888; border: none; cursor: pointer; }
</style>
