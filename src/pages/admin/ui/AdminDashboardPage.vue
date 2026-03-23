<script setup lang="ts">
import { ref, watch } from 'vue';
import { LogOut } from 'lucide-vue-next';
import { useAuthStore } from '@/entities/user/model/store';
import { useRouter } from 'vue-router';
import AdminProductsWidget from '@/widgets/admin-products/ui/AdminProductsWidget.vue';
import AdminSellersWidget from '@/widgets/admin-sellers/ui/AdminSellersWidget.vue';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'login' });
};

const activeTab = ref<'products'|'sellers'>('products');

watch(activeTab, (newVal) => {
  document.title = `Admin: ${newVal === 'products' ? 'Products' : 'Sellers'}`;
}, { immediate: true });
</script>

<template>
  <div class="admin-dashboard">
    <div class="header">
      <div class="top-row">
        <h1>Admin Dashboard</h1>
        <button @click="handleLogout" class="add-btn logout-btn">
          <LogOut class="sm-icon" /> Logout
        </button>
      </div>
      
      <div class="bottom-row">
        <div class="tabs">
          <button 
            :class="{ active: activeTab === 'products' }" 
            @click="activeTab = 'products'"
          >Products</button>
          <button 
            :class="{ active: activeTab === 'sellers' }" 
            @click="activeTab = 'sellers'"
          >Sellers</button>
        </div>
      </div>
    </div>

    <!-- Widgets -->
    <AdminProductsWidget v-if="activeTab === 'products'" />
    <AdminSellersWidget v-if="activeTab === 'sellers'" />
  </div>
</template>

<style scoped>
.admin-dashboard {
  padding: 2rem;
  height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-shrink: 0;
}
.top-row, .bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.top-row h1 {
  margin: 0;
}
.tabs { display: flex; gap: 1rem; }
.tabs button {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  color: #888;
  cursor: pointer;
}
.tabs button.active {
  background: #4facfe;
  color: white;
  border-color: #4facfe;
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
.logout-btn {
  background: rgba(255, 99, 132, 0.1);
  color: #ff6384;
  border: 1px solid rgba(255, 99, 132, 0.3);
  margin-left: 0;
}
.sm-icon { width: 16px; height: 16px; }
</style>
