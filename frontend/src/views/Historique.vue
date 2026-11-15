<!-- Affiche l'historique des parties jouées sur GeoWorld. -->
<template>
    <v-container fluid class="history-page py-10">
        <div class="background-glow glow-one"></div>
        <div class="background-glow glow-two"></div>

        <v-row justify="center">
            <v-col cols="12" xl="9" lg="10">
                <header class="history-header text-center mb-10">
                    <div class="hero-icon mx-auto mb-5">
                        <v-icon icon="mdi-history" size="42" color="#67e8f9" />
                    </div>

                    <div class="eyebrow mb-3">
                        <span class="eyebrow-dot"></span>
                        GEO WORLD EXPERIENCE
                    </div>

                    <h1 class="hero-title">
                        Mon <span>historique</span>
                    </h1>

                    <p class="hero-description mt-4">
                        Retrouve tes parties et suis ta progression à travers le monde.
                    </p>
                </header>

                <v-row v-if="!loading && !error" class="mb-6" dense>
                    <v-col cols="12" sm="6">
                        <v-card class="stat-card pa-5" rounded="xl" elevation="0">
                            <div class="d-flex align-center ga-4">
                                <v-avatar color="cyan-darken-4" size="54">
                                    <v-icon icon="mdi-controller" size="28" color="#67e8f9" />
                                </v-avatar>
                                <div>
                                    <p class="stat-label">Parties jouées</p>
                                    <p class="stat-value">{{ parties.length }}</p>
                                </div>
                            </div>
                        </v-card>
                    </v-col>

                    <v-col cols="12" sm="6">
                        <v-card class="stat-card pa-5" rounded="xl" elevation="0">
                            <div class="d-flex align-center ga-4">
                                <v-avatar color="cyan-darken-4" size="54">
                                    <v-icon icon="mdi-trophy-outline" size="28" color="#67e8f9" />
                                </v-avatar>
                                <div>
                                    <p class="stat-label">Meilleur score</p>
                                    <p class="stat-value">{{ meilleurScore }}</p>
                                </div>
                            </div>
                        </v-card>
                    </v-col>
                </v-row>

                <v-card class="history-card" rounded="xl" elevation="0">
                    <div class="card-top-line"></div>

                    <div class="history-content">
                        <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
                            <div class="section-heading">
                                <div class="section-icon">
                                    <v-icon icon="mdi-format-list-bulleted" size="24" />
                                </div>
                                <div>
                                    <h2>Mes dernières parties</h2>
                                    <p>Consulte les résultats de tes quiz.</p>
                                </div>
                            </div>

                            <v-btn
                                variant="tonal"
                                color="cyan"
                                prepend-icon="mdi-refresh"
                                :loading="loading"
                                @click="chargerHistorique"
                            >
                                Actualiser
                            </v-btn>
                        </div>

                        <div v-if="loading" class="loading-state">
                            <v-progress-circular indeterminate color="#67e8f9" size="42" width="3" />
                            <p class="mt-4">Chargement de ton historique...</p>
                        </div>

                        <v-alert
                            v-else-if="error"
                            type="error"
                            variant="tonal"
                            rounded="lg"
                        >
                            {{ error }}
                            <template #append>
                                <v-btn variant="text" color="error" @click="chargerHistorique">
                                    Réessayer
                                </v-btn>
                            </template>
                        </v-alert>

                        <div v-else-if="parties.length === 0" class="empty-state">
                            <v-avatar class="empty-icon mb-5" size="82">
                                <v-icon icon="mdi-earth" size="44" color="#67e8f9" />
                            </v-avatar>
                            <h3>Aucune partie pour le moment</h3>
                            <p class="mt-2">
                                Lance ton premier quiz et tes résultats apparaîtront ici.
                            </p>
                            <v-btn
                                color="cyan"
                                class="mt-6"
                                prepend-icon="mdi-play"
                                to="/quizz"
                            >
                                Jouer un quiz
                            </v-btn>
                        </div>

                        <v-list v-else class="history-list" bg-color="transparent" lines="two">
                            <v-list-item
                                v-for="partie in parties"
                                :key="partie.id"
                                class="history-item mb-3"
                                rounded="lg"
                            >
                                <template #prepend>
                                    <v-avatar class="category-avatar" size="48">
                                        <v-icon :icon="iconeCategorie(partie.categorie)" size="25" />
                                    </v-avatar>
                                </template>

                                <v-list-item-title class="item-title">
                                    {{ partie.categorie }}
                                </v-list-item-title>

                                <v-list-item-subtitle class="item-date mt-1">
                                    <v-icon icon="mdi-calendar-clock" size="15" class="mr-1" />
                                    {{ formaterDate(partie.date) }}
                                </v-list-item-subtitle>

                                <template #append>
                                    <div class="score-chip">
                                        <v-icon icon="mdi-star" size="18" class="mr-1" />
                                        <span>{{ partie.score }}</span>
                                        <span class="score-unit ml-1">pt(s)</span>
                                    </div>
                                </template>
                            </v-list-item>
                        </v-list>
                    </div>
                </v-card>

                <div class="text-center mt-7">
                    <v-btn
                        variant="outlined"
                        color="cyan"
                        prepend-icon="mdi-arrow-left"
                        to="/quizz"
                    >
                        Retour aux quiz
                    </v-btn>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { requeteAuthentifiee } from "../services/authService";

const parties = ref([]);
const loading = ref(true);
const error = ref("");

const meilleurScore = computed(() => {
    if (parties.value.length === 0) return "—";
    return Math.max(...parties.value.map(partie => partie.score));
});

function nomCategorie(partie) {
    const categorie = partie.category || partie.categorie;
    const code = typeof categorie === "object"
        ? categorie?.code_category || categorie?.name_category
        : categorie || partie.categoryCode;

    const noms = {
        CAPITALS: "Capitales",
        FLAGS: "Drapeaux",
        CURRENCIES: "Monnaies",
    };

    return noms[code] || code || "Quiz GeoWorld";
}

function normaliserPartie(partie, index) {
    return {
        id: partie.storyId ?? partie.id ?? index,
        score: Number(partie.score) || 0,
        date: partie.date || partie.created_at || null,
        categorie: nomCategorie(partie),
    };
}

async function chargerHistorique() {
    loading.value = true;
    error.value = "";

    try {
        const response = await requeteAuthentifiee("/stories");

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || "Impossible de récupérer ton historique.");
        }

        const data = await response.json();
        const liste = Array.isArray(data)
            ? data
            : data.stories || data.data || [];

        if (!Array.isArray(liste)) {
            throw new Error("Le format des données reçues est invalide.");
        }

        parties.value = liste
            .map(normaliserPartie)
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    } catch (err) {
        console.error("Erreur lors du chargement de l'historique :", err);
        error.value = err.message || "Une erreur est survenue lors du chargement.";
    } finally {
        loading.value = false;
    }
}

function formaterDate(date) {
    if (!date) return "Date inconnue";

    const valeur = new Date(date);
    if (Number.isNaN(valeur.getTime())) return "Date inconnue";

    return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
    }).format(valeur);
}

function iconeCategorie(categorie) {
    const icones = {
        Capitales: "mdi-city-variant-outline",
        Drapeaux: "mdi-flag-outline",
        Monnaies: "mdi-cash-multiple",
    };

    return icones[categorie] || "mdi-earth";
}

onMounted(chargerHistorique);
</script>

<style scoped>
.history-page {
    position: relative;
    box-sizing: border-box;
    min-height: 100vh;
    min-height: 100dvh;
    overflow: hidden;
    background: #07111f;
    color: #e5edf8;
    isolation: isolate;
}

.background-glow {
    position: absolute;
    z-index: -1;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.12;
    pointer-events: none;
}

.glow-one {
    top: 30px;
    left: -180px;
    background: #0891b2;
}

.glow-two {
    top: 420px;
    right: -200px;
    background: #2563eb;
}

.history-header {
    position: relative;
}

.hero-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 76px;
    height: 76px;
    border: 1px solid rgba(103, 232, 249, 0.3);
    border-radius: 24px;
    background: rgba(8, 145, 178, 0.12);
    box-shadow: 0 0 45px rgba(34, 211, 238, 0.1);
}

.eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: #67e8f9;
    font-size: 0.73rem;
    font-weight: 700;
    letter-spacing: 0.2em;
}

.eyebrow-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #67e8f9;
    box-shadow: 0 0 12px rgba(103, 232, 249, 0.7);
}

.hero-title {
    color: #f8fafc;
    font-size: clamp(2.5rem, 6vw, 4.3rem);
    font-weight: 800;
    letter-spacing: -0.055em;
    line-height: 1.1;
}

.hero-title span {
    color: #67e8f9;
}

.hero-description {
    max-width: 540px;
    margin-right: auto;
    margin-left: auto;
    color: #94a3b8;
    font-size: 1.05rem;
    line-height: 1.7;
}

.stat-card,
.history-card {
    border: 1px solid rgba(148, 163, 184, 0.15);
    background: rgba(12, 25, 43, 0.92);
    color: #e5edf8;
}

.stat-label {
    color: #94a3b8;
    font-size: 0.88rem;
}

.stat-value {
    margin-top: 3px;
    color: #67e8f9;
    font-size: 1.8rem;
    font-weight: 800;
}

.card-top-line {
    height: 3px;
    background: linear-gradient(90deg, transparent, #22d3ee, #3b82f6, transparent);
}

.history-content {
    padding: clamp(20px, 4vw, 36px);
}

.section-heading {
    display: flex;
    align-items: center;
    gap: 14px;
}

.section-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    border: 1px solid rgba(103, 232, 249, 0.18);
    border-radius: 14px;
    background: rgba(8, 145, 178, 0.12);
    color: #67e8f9;
}

.section-heading h2 {
    color: #f1f5f9;
    font-size: 1.15rem;
    font-weight: 700;
}

.section-heading p {
    margin-top: 4px;
    color: #8495aa;
    font-size: 0.88rem;
}

.loading-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 220px;
    color: #94a3b8;
    text-align: center;
}

.empty-icon {
    border: 1px solid rgba(103, 232, 249, 0.2);
    background: rgba(8, 145, 178, 0.12);
}

.empty-state h3 {
    color: #f1f5f9;
    font-size: 1.2rem;
    font-weight: 700;
}

.empty-state p {
    max-width: 380px;
    line-height: 1.6;
}

.history-list {
    padding: 0;
}

.history-item {
    border: 1px solid rgba(148, 163, 184, 0.12);
    background: rgba(15, 31, 51, 0.75);
    transition: border-color 0.2s ease, background 0.2s ease;
}

.history-item:hover {
    border-color: rgba(103, 232, 249, 0.4);
    background: rgba(17, 39, 61, 0.95);
}

.category-avatar {
    margin-right: 14px;
    border: 1px solid rgba(103, 232, 249, 0.2);
    background: rgba(8, 145, 178, 0.13);
    color: #67e8f9;
}

.item-title {
    color: #f1f5f9;
    font-size: 1rem;
    font-weight: 700;
}

.item-date {
    color: #94a3b8;
    opacity: 1;
}

.score-chip {
    display: flex;
    align-items: center;
    padding: 9px 12px;
    border: 1px solid rgba(103, 232, 249, 0.2);
    border-radius: 12px;
    background: rgba(8, 145, 178, 0.12);
    color: #67e8f9;
    font-weight: 800;
}

.score-unit {
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 500;
}

@media (max-width: 600px) {
    .history-page {
        padding-right: 12px;
        padding-left: 12px;
    }

    .history-content {
        padding: 20px 14px;
    }

    .history-item {
        padding-top: 12px;
        padding-bottom: 12px;
    }

    .category-avatar {
        margin-right: 8px;
    }

    .score-chip {
        padding: 7px 9px;
    }
}
</style>