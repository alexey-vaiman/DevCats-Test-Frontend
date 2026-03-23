<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, Plus, Trash2, Image as ImageIcon } from 'lucide-vue-next';
import { apiClient } from '@/shared/api';

interface Props {
  product: any;
  show: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'updated']);

const editData = ref({
  name: '',
  price: { amount: 0, currency: 'USD' },
  stock: 0,
  attributes: [] as { key: string, value: string }[]
});

const handleTriggerUpload = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e: any) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      await apiClient.post(`admin/products/${props.product.id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      emit('updated');
    } catch (err) {
      alert('Upload failed');
    }
  };
  input.click();
};

watch(() => props.product, (newVal) => {
  if (newVal) {
    editData.value = {
      name: newVal.name,
      price: { ...newVal.price },
      stock: newVal.stock,
      attributes: newVal.attributes ? [...newVal.attributes] : []
    };
  }
}, { immediate: true });

const addAttribute = () => {
  editData.value.attributes.push({ key: '', value: '' });
};

const removeAttribute = (index: number) => {
  editData.value.attributes.splice(index, 1);
};

const handleSave = async () => {
  try {
    await apiClient.put(`admin/products/${props.product.id}`, editData.value);
    emit('updated');
    emit('close');
  } catch (err) {
    alert('Failed to update product');
  }
};
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Edit Product</h2>
        <button @click="emit('close')" class="close-btn"><X /></button>
      </div>
      
      <div class="modal-body">
        <div class="image-upload-section">
          <div class="current-image">
            <img :src="product?.thumbnail_url || 'https://via.placeholder.com/150?text=No+Image'" class="modal-thumb" />
            <button @click="handleTriggerUpload" class="upload-btn-overlay">
              <ImageIcon /> Change Photo
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Name</label>
          <input v-model="editData.name" type="text" />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Price Amount</label>
            <input v-model.number="editData.price.amount" type="number" step="0.01" />
          </div>
          <div class="form-group">
            <label>Currency</label>
            <input v-model="editData.price.currency" type="text" />
          </div>
        </div>

        <div class="form-group">
          <label>Stock</label>
          <input v-model.number="editData.stock" type="number" />
        </div>

        <div class="attributes-section">
          <div class="section-header">
            <h3>Attributes</h3>
            <button @click="addAttribute" class="btn-sm"><Plus /> Add</button>
          </div>
          <div v-for="(attr, index) in editData.attributes" :key="index" class="attr-row">
            <input v-model="attr.key" placeholder="Key (e.g. Color)" />
            <input v-model="attr.value" placeholder="Value (e.g. Red)" />
            <button @click="removeAttribute(index)" class="del-btn"><Trash2 /></button>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="emit('close')" class="cancel-btn">Cancel</button>
        <button @click="handleSave" class="save-btn">Save Changes</button>
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
  max-width: 500px;
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
.image-upload-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}
.current-image {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px dashed #333;
}
.modal-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.upload-btn-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s;
  border: none;
  cursor: pointer;
}
.current-image:hover .upload-btn-overlay {
  opacity: 1;
}
.close-btn { background: none; border: none; color: #888; }
.form-group { margin-bottom: 1.5rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #888; font-size: 0.9rem; }
.form-group input { 
  width: 100%; padding: 0.75rem; border-radius: 8px; 
  background: #000; border: 1px solid #333; color: white;
}
.attributes-section {
  border-top: 1px solid #333;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.attr-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.attr-row input {
  flex: 1;
  padding: 0.5rem;
  background: #000;
  border: 1px solid #333;
  color: white;
  border-radius: 6px;
}
.del-btn { color: #ff4d4f; padding: 0.5rem; }
.btn-sm {
  background: rgba(255,255,255,0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
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
