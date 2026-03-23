<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="logo">Marketplace</router-link>
      <div class="nav-links">
        <router-link to="/">Catalog</router-link>
        <router-link to="/admin">Admin</router-link>
      </div>
    </div>
  </nav>

  <main class="main-content">
    <RouterView />
  </main>
</template>

<style>
.navbar {
  background: rgba(15, 15, 15, 0.7);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}
.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
}
.nav-links {
  display: flex;
  gap: 2rem;
}
.nav-links a {
  color: #ccc;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}
.nav-links a:hover, .nav-links a.router-link-active {
  color: #4facfe;
}
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 70px);
}
</style>
