```vue
<!-- Regroupe la navigation GeoWorld et la recherche dans un volet latéral repliable. -->
<template>
    <v-navigation-drawer
        id="geoWorldDrawer"
        location="right"
        permanent
        :rail="!drawerOpen"
        :width="280"
        :rail-width="72"
        elevation="8"
    >
        <div class="drawer-content">
            <div class="drawer-header" :class="{ 'drawer-header-rail': !drawerOpen }">
                <router-link to="/" class="logo-container" aria-label="Accueil GeoWorld">
                    <img class="logo" src="../pictures/logo1.webp" alt="GeoWorld" />
                </router-link>

                <v-btn
                    icon
                    variant="text"
                    class="toggle-btn"
                    :aria-label="drawerOpen ? 'Replier le menu' : 'Déplier le menu'"
                    @click="drawerOpen = !drawerOpen"
                >
                    <v-icon>{{ drawerOpen ? "mdi-chevron-right" : "mdi-chevron-left" }}</v-icon>
                </v-btn>
            </div>

            <v-divider class="drawer-divider" />

            <template v-if="!isAuthPage">
                <v-list nav class="navigation-list">
                    <v-tooltip
                        v-for="link in links"
                        :key="link.title"
                        location="left"
                        :text="link.title"
                        :disabled="drawerOpen"
                    >
                        <template #activator="{ props }">
                            <v-list-item
                                v-bind="props"
                                :to="link.to"
                                :active="isLinkActive(link)"
                                :prepend-icon="link.icon"
                                :title="drawerOpen ? link.title : undefined"
                                rounded="lg"
                                class="navigation-item"
                                color="cyan-lighten-2"
                            />
                        </template>
                    </v-tooltip>
                </v-list>

                <template v-if="isMapPage">
                    <v-divider class="drawer-divider" />

                    <div class="search-section">
                        <v-tooltip
                            location="left"
                            :text="showSearch ? 'Fermer la recherche' : 'Rechercher un pays'"
                            :disabled="drawerOpen"
                        >
                            <template #activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    block
                                    variant="tonal"
                                    color="cyan-lighten-2"
                                    class="search-toggle"
                                    :class="{ 'rail-search': !drawerOpen }"
                                    :icon="!drawerOpen"
                                    :aria-label="showSearch ? 'Fermer la recherche' : 'Rechercher un pays'"
                                    @click="handleSearchToggle"
                                >
                                    <v-icon>{{ showSearch ? "mdi-close" : "mdi-magnify" }}</v-icon>
                                    <span v-if="drawerOpen" class="search-button-label">
                                        {{ showSearch ? "Fermer la recherche" : "Rechercher un pays" }}
                                    </span>
                                </v-btn>
                            </template>
                        </v-tooltip>

                        <v-expand-transition>
                            <div v-if="showSearch && drawerOpen" class="search-content">
                                <v-text-field
                                    :model-value="countryQuery"
                                    placeholder="Rechercher un pays"
                                    variant="outlined"
                                    density="compact"
                                    hide-details
                                    clearable
                                    aria-label="Rechercher un pays"
                                    @update:model-value="updateCountryQuery"
                                    @keydown.enter="runSearch"
                                    @keydown.esc="closeSearch"
                                />

                                <v-btn
                                    block
                                    color="cyan-lighten-2"
                                    variant="flat"
                                    class="search-submit"
                                    @click="runSearch"
                                >
                                    <v-icon start>mdi-magnify</v-icon>
                                    Rechercher
                                </v-btn>

                                <div v-if="searchHasRun" class="search-results">
                                    <div v-if="isSearching" class="search-message">
                                        Recherche en cours...
                                    </div>

                                    <v-list
                                        v-else-if="searchResults.length"
                                        density="compact"
                                        class="results-list"
                                    >
                                        <v-list-item
                                            v-for="result in searchResults"
                                            :key="`${result.type}-${result.item.countryId ?? result.item.territoryId}`"
                                            :title="getResultName(result)"
                                            :subtitle="getResultDetails(result)"
                                            :prepend-icon="result.type === 'territory' ? 'mdi-island' : 'mdi-earth'"
                                            @click="selectSearchResult(result)"
                                        />
                                    </v-list>

                                    <div v-else class="search-message">
                                        Aucun pays trouvé.
                                    </div>
                                </div>
                            </div>
                        </v-expand-transition>
                    </div>
                </template>
            </template>

            <v-spacer />

            <div class="drawer-bottom">
                <template v-if="authReady && !isLoggedIn">
                    <v-tooltip location="left" text="Se connecter" :disabled="drawerOpen">
                        <template #activator="{ props }">
                            <v-btn
                                v-bind="props"
                                :block="drawerOpen"
                                :icon="!drawerOpen"
                                color="cyan-lighten-2"
                                variant="flat"
                                rounded="lg"
                                class="account-btn"
                                to="/connexion"
                                aria-label="Se connecter"
                            >
                                <v-icon :start="drawerOpen">mdi-login</v-icon>
                                <span v-if="drawerOpen">Se connecter</span>
                            </v-btn>
                        </template>
                    </v-tooltip>
                </template>

                <template v-else-if="isLoggedIn && !isAuthPage">
                    <v-tooltip location="left" text="Se déconnecter" :disabled="drawerOpen">
                        <template #activator="{ props }">
                            <v-btn
                                v-bind="props"
                                :block="drawerOpen"
                                :icon="!drawerOpen"
                                variant="text"
                                class="logout-btn"
                                aria-label="Se déconnecter"
                                @click="logoutUser"
                            >
                                <v-icon :start="drawerOpen">mdi-logout</v-icon>
                                <span v-if="drawerOpen">Se déconnecter</span>
                            </v-btn>
                        </template>
                    </v-tooltip>
                </template>
            </div>
        </div>
    </v-navigation-drawer>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
    getAccessToken,
    deconnecter,
    restaurerSession,
} from "../services/authService";
import { useCountrySearch } from "../map/useCountrySearch";

const router = useRouter();
const route = useRoute();

const drawerOpen = ref(false);
const isLoggedIn = ref(!!getAccessToken());
const authReady = ref(false);

const links = [
    { title: "Accueil", to: "/", icon: "mdi-home-outline" },
    { title: "Quiz", to: "/quiz", icon: "mdi-earth" },
    { title: "Historique", to: "/historique", icon: "mdi-history" },
    { title: "Profil", to: "/profil", icon: "mdi-account-outline" },
];

const {
    showSearch,
    countryQuery,
    searchResults,
    isSearching,
    searchHasRun,
    toggleSearch,
    updateCountryQuery,
    closeSearch,
    getResultName,
    getResultDetails,
    runSearch,
    selectSearchResult,
} = useCountrySearch();

const isMapPage = computed(() => route.path === "/");

const isAuthPage = computed(
    () => ["/connexion", "/inscription"].includes(route.path) || route.name === "NotFound",
);

function isLinkActive(link) {
    const path = route.path;

    if (link.title === "Quiz") {
        return /^\/quizz?(\/|$)/.test(path);
    }

    if (link.to === "/") {
        return path === "/";
    }

    return path === link.to || path.startsWith(`${link.to}/`);
}

function updateLoginStatus() {
    isLoggedIn.value = !!getAccessToken();
}

function handleSearchToggle() {
    if (!drawerOpen.value) {
        drawerOpen.value = true;

        if (!showSearch.value) {
            toggleSearch();
        }

        return;
    }

    if (showSearch.value) {
        closeSearch();
    } else {
        toggleSearch();
    }
}

function handleOutsideClick(event) {
    const drawer = document.querySelector("#geoWorldDrawer");

    if (drawerOpen.value && drawer && !drawer.contains(event.target)) {
        drawerOpen.value = false;
    }
}

async function logoutUser() {
    await deconnecter();
    updateLoginStatus();
    router.push("/connexion");
}

onMounted(async () => {
    document.addEventListener("click", handleOutsideClick);
    window.addEventListener("connexion-changee", updateLoginStatus);

    await restaurerSession();
    updateLoginStatus();
    authReady.value = true;
});

onUnmounted(() => {
    document.removeEventListener("click", handleOutsideClick);
    window.removeEventListener("connexion-changee", updateLoginStatus);
});
</script>


<style scoped>
#geoWorldDrawer {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    z-index: 1000;
    background: #0b1220;
    color: #f1f5f9;
    border-left: 1px solid rgba(103, 232, 249, 0.16);
}

.drawer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-x: hidden;
    background: linear-gradient(180deg, #111c2e 0%, #0b1220 100%);
}

.drawer-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 84px;
    padding: 14px 12px;
    gap: 14px;
}

.logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    flex: 1;
}

.logo {
    display: block;
    width: 50px;
    height: auto;
    filter: invert(100%) sepia(100%) hue-rotate(180deg) saturate(1000%) contrast(1);
    transition: transform 0.2s ease;
}

.logo-container:hover .logo {
    transform: scale(1.06);
}

.toggle-btn {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    color: #67e8f9;
    background: rgba(103, 232, 249, 0.12);
    border: 1px solid rgba(103, 232, 249, 0.4);
    border-radius: 12px;
    box-shadow: 0 0 12px rgba(103, 232, 249, 0.08);
    transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.toggle-btn :deep(.v-icon) {
    font-size: 30px;
}

.toggle-btn:hover {
    background: rgba(103, 232, 249, 0.24);
    box-shadow: 0 0 16px rgba(103, 232, 249, 0.2);
}

.drawer-header-rail {
    flex-direction: column;
    justify-content: center;
    min-height: 112px;
    padding: 8px 4px;
    gap: 4px;
}

.drawer-header-rail .logo-container {
    flex: 0 0 auto;
    width: 100%;
}

.drawer-header-rail .logo {
    width: 38px;
}

.drawer-header-rail .toggle-btn {
    width: 40px;
    height: 40px;
    margin-top: 6px;
}

.drawer-divider {
    border-color: rgba(148, 163, 184, 0.16);
}

.navigation-list {
    padding: 14px 10px;
}

.navigation-item {
    min-height: 50px;
    margin: 5px 0;
    color: #cbd5e1;
    font-size: 1rem;
}

.navigation-item :deep(.v-list-item-title) {
    font-size: 1rem;
    font-weight: 600;
}

.navigation-item :deep(.v-list-item__overlay) {
    background: rgba(103, 232, 249, 0.08);
}

.navigation-item :deep(.v-list-item__prepend > .v-icon) {
    opacity: 1;
}

.search-section {
    padding: 14px 12px;
}

.search-toggle {
    min-height: 46px;
    justify-content: flex-start;
    text-transform: none;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0;
}

.search-button-label {
    margin-left: 10px;
    white-space: normal;
    text-align: left;
    font-size: 1rem;
}

.rail-search {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    min-width: 44px;
    height: 44px;
    margin: 0 auto;
    padding: 0;
}

.rail-search :deep(.v-btn__content) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.rail-search :deep(.v-icon) {
    margin: 0;
}

.search-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 14px;
}

.search-content :deep(.v-field) {
    color: #f8fafc;
    background: rgba(15, 23, 42, 0.7);
}

.search-content :deep(.v-field__outline) {
    color: rgba(103, 232, 249, 0.35);
}

.search-content :deep(input) {
    color: #f8fafc;
}

.search-submit {
    color: #0b1220;
    font-weight: 700;
    text-transform: none;
}

.search-results {
    overflow-y: auto;
    max-height: 40vh;
    border: 1px solid rgba(103, 232, 249, 0.2);
    border-radius: 10px;
    background: #101a29;
}

.results-list {
    background: transparent;
    color: #f8fafc;
}

.results-list :deep(.v-list-item-title) {
    white-space: normal;
    color: #f8fafc;
    font-weight: 600;
}

.results-list :deep(.v-list-item-subtitle) {
    white-space: normal;
    line-height: 1.4;
    margin-top: 4px;
    color: #cbd5e1;
}

.search-message {
    padding: 14px;
    color: #cbd5e1;
    font-size: 13px;
}

.drawer-bottom {
    padding: 14px 12px 20px;
}

.account-btn,
.logout-btn {
    min-height: 46px;
    font-size: 1rem;
    text-transform: none;
    font-weight: 600;
}

.account-btn {
    color: #0b1220;
}

.logout-btn {
    color: #cbd5e1;
}

@media (max-width: 600px) {
    .drawer-header {
        min-height: 72px;
    }

    .logo {
        width: 42px;
    }
}
</style>
```