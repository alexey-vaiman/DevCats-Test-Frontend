<script setup lang="ts">
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import apiClient from '../api';

interface Props {
  seller: any;
  show: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'updated']);

const editData = ref({
  name: '',
  description: '',
  rating: 5.0
});

watch(() => props.seller, (newVal) => {
  if (newVal) {
    editData.value = {
      name: newVal.name,
      description: newVal.description || '',
      rating: Number(newVal.rating) || 5.0
    };
  } else {
    editData.value = { name: '', description: '', rating: 5.0 };
  }
}, { immediate: true });

const handleSave = async () => {
  try {
    if (props.seller) {
      await apiClient.put(`admin/sellers/${props.seller.id}`, editData.value);
    } else {
      await apiClient.post('admin/sellers', editData.value);
    }
    emit('updated');
    emit('close');
  } catch (err) {
    alert('Failed to save seller');
  }
};
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ seller ? 'Edit Seller' : 'New Seller' }}</h2>
        <button @click="emit('close')" class="close-btn"><X /></button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label>Name</label>
          <input v-model="editData.name" type="text" placeholder="Seller Name" />
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="editData.description" placeholder="Seller Description" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>Rating (1.0 - 5.0)</label>
          <input v-model.number="editData.rating" type="number" step="0.1" min="1" max="5" />
        </div>
      </div>

      <div class="modal-actions">
        <button @click="emit('close')" class="cancel-btn">Cancel</button>
        <button @click="handleSave" class="save-btn">Save</button>
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
  max-width: 450px;
  border: 1px solid rgba(255,255,255,0.1);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.close-btn { background: none; border: none; color: #888; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #888; }
.form-group input, .form-group textarea { 
  width: 100%; padding: 0.75rem; border-radius: 8px; 
  background: #000; border: 1px solid #333; color: white;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
.save-btn { background: #4facfe; color: white; font-weight: 700; }
.cancel-btn { color: #888; }
</style>
