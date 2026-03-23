# DevCats Marketplace Frontend

A modern Vue 3 + TypeScript application for the DevCats Marketplace, built with Feature-Sliced Design (FSD).

## Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Icons**: [Lucide Vue Next](https://lucide.dev/web-icons/lucide-vue-next)
- **Styling**: Vanilla CSS (Premium design system)
- **HTTP Client**: Axios (Custom `apiClient` in `shared/api`)

## Architecture: Feature-Sliced Design (FSD)

The project is structured according to the **Feature-Sliced Design** methodology to ensure scalability and developer-friendly modularity:

-   **`src/app/`**: Global styles, router configuration, and entry point.
-   **`src/pages/`**: Complete views (e.g., Catalog, Product Detail, Admin Dashboard).
-   **`src/widgets/`**: Complex components that combine features and entities (e.g., `AdminProductsWidget`).
-   **`src/features/`**: Interactive parts of the UI that perform actions (e.g., `EditProductModal`).
-   **`src/entities/`**: Domain-specific logic and data structures (e.g., Product model, User store).
-   **`src/shared/`**: Reusable UI components, API clients, and utilities.

## Key Features

-   **Premium Design**: Modern HSL-based color palette, glassmorphism, and smooth micro-animations.
-   **Infinite Scroll**: Efficiently renders large product lists via custom `VirtualScroller` and Cursor-based pagination.
-   **Typed API**: Full TypeScript integration for backend responses and payloads.
-   **Proxy Mode**: Integrated Vite proxy for local development against the backend API.

## Local Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Configure environment**:
    Copy `.env.example` to `.env`.
3.  **Start Development Server**:
    ```bash
    npm run dev
    ```
4.  **Build for Production**:
    ```bash
    npm run build
    ```

## Development Workflow

Follow FSD rules when adding new components:
1.  Define domain models in `src/entities/`.
2.  Create shared UI elements in `src/shared/ui/`.
3.  Assemble feature-rich widgets in `src/widgets/`.
4.  Combine everything into `src/pages/`.
