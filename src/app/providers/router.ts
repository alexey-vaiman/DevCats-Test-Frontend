import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'catalog',
      component: () => import('@/pages/catalog/ui/CatalogPage.vue'),
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: () => import('@/pages/product-detail/ui/ProductDetailPage.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/pages/admin/ui/AdminDashboardPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/login',
      name: 'login',
      component: () => import('@/pages/login/ui/LoginPage.vue'),
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' });
  } else {
    next();
  }
});
