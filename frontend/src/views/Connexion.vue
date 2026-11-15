
<!-- Affiche le formulaire de connexion GeoWorld et transmet les identifiants au backend. -->
<template>
    <v-container fluid class="auth-page d-flex align-center justify-center pa-4">
        <div class="background-glow glow-one"></div>
        <div class="background-glow glow-two"></div>

        <v-card class="auth-card" rounded="xl" elevation="0">
            <div class="auth-header">
                <router-link to="/" class="logo-link" aria-label="Retour à l'accueil GeoWorld">
                    <img class="auth-logo" src="../pictures/logo1.webp" alt="GeoWorld" />
                </router-link>

                <div class="auth-eyebrow">BIENVENUE SUR GEOWORLD</div>
                <h1 class="auth-title">Connexion</h1>
                <p class="auth-subtitle">Connecte-toi pour retrouver ton espace personnel.</p>
            </div>

            <v-card-text class="auth-form">
                <v-alert
                    v-if="message"
                    :type="typeMessage"
                    variant="tonal"
                    class="mb-5"
                    closable
                    @click:close="message = ''"
                >
                    {{ message }}
                </v-alert>

                <v-form v-model="valid" @submit.prevent="connecter" autocomplete="off">
                    <v-text-field
                        v-model="email"
                        label="Adresse e-mail"
                        type="email"
                        autocomplete="off"
                        prepend-inner-icon="mdi-email-outline"
                        variant="outlined"
                        color="cyan-lighten-2"
                        base-color="blue-grey-lighten-1"
                        rounded="lg"
                        :rules="emailRules"
                        required
                    />

                    <v-text-field
                        v-model="password"
                        label="Mot de passe"
                        autocomplete="new-password"
                        prepend-inner-icon="mdi-lock-outline"
                        :type="showPassword ? 'text' : 'password'"
                        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                        @click:append-inner="showPassword = !showPassword"
                        variant="outlined"
                        color="cyan-lighten-2"
                        base-color="blue-grey-lighten-1"
                        rounded="lg"
                        :rules="[v => !!v || 'Le mot de passe est obligatoire']"
                        required
                    />

                    <v-btn
                        type="submit"
                        color="cyan-lighten-2"
                        block
                        size="large"
                        rounded="lg"
                        class="login-btn mt-2"
                        :disabled="!valid || chargement"
                        :loading="chargement"
                    >
                        <span>Se connecter</span>
                        <v-icon end>mdi-arrow-right</v-icon>
                    </v-btn>
                </v-form>

                <div class="register-prompt">
                    <span>Pas encore de compte ?</span>
                    <router-link to="/inscription">Créer un compte</router-link>
                </div>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { connecter as seConnecter } from "../services/authService";

const router = useRouter();
const valid = ref(false);
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const chargement = ref(false);
const message = ref("");
const typeMessage = ref("error");

const emailRules = [
    v => !!v || "L’adresse e-mail est obligatoire",
    v => /.+@.+\..+/.test(v) || "L’adresse e-mail est invalide",
];

async function connecter() {
    message.value = "";
    chargement.value = true;

    try {
        await seConnecter(email.value.trim(), password.value);
        router.push("/");
    } catch (error) {
        message.value = error.message || "Impossible de se connecter.";
    } finally {
        chargement.value = false;
    }
}
</script>

<style scoped>
.auth-page {
    position: relative;
    box-sizing: border-box;
    min-height: 100vh;
    min-height: 100dvh;
    overflow: hidden;
    isolation: isolate;
    background:
        radial-gradient(ellipse at 50% 0%, rgba(20, 75, 125, 0.2), transparent 55%),
        #07111f;
    color: #e5edf8;
}

.background-glow {
    position: absolute;
    z-index: -1;
    width: 340px;
    height: 340px;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.16;
    pointer-events: none;
}

.glow-one {
    top: 5%;
    left: -150px;
    background: #0891b2;
}

.glow-two {
    right: -160px;
    bottom: 0;
    background: #2563eb;
}

.auth-card {
    position: relative;
    width: 100%;
    max-width: 460px;
    padding: 12px;
    overflow: hidden;
    border: 1px solid rgba(103, 232, 249, 0.17);
    background: linear-gradient(155deg, #111e30 0%, #0b1423 100%);
    color: #e5edf8;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
}

.auth-header {
    padding: 30px 24px 12px;
    text-align: center;
}

.logo-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}

.auth-logo {
    display: block;
    width: 68px;
    height: auto;
    filter: invert(100%) sepia(100%) hue-rotate(180deg) saturate(1000%) contrast(1);
    transition: transform 0.2s ease;
}

.logo-link:hover .auth-logo {
    transform: scale(1.06);
}

.auth-eyebrow {
    margin-bottom: 10px;
    color: #67e8f9;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 2px;
}

.auth-title {
    color: #f8fafc;
    font-size: 2rem;
    font-weight: 750;
    letter-spacing: -0.7px;
}

.auth-subtitle {
    max-width: 310px;
    margin: 10px auto 0;
    color: #94a3b8;
    font-size: 0.95rem;
    line-height: 1.6;
}

.auth-form {
    padding: 20px 24px 28px;
}

.auth-form :deep(.v-field) {
    background: rgba(7, 17, 31, 0.55);
}

.auth-form :deep(.v-field__outline) {
    color: rgba(148, 163, 184, 0.35);
}

.auth-form :deep(.v-field--focused .v-field__outline) {
    color: #67e8f9;
}

.auth-form :deep(.v-label),
.auth-form :deep(.v-field__input),
.auth-form :deep(.v-icon) {
    color: #cbd5e1;
}

.login-btn {
    min-height: 50px;
    color: #07111f;
    font-weight: 750;
    text-transform: none;
    letter-spacing: 0;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(103, 232, 249, 0.15);
}

.register-prompt {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
    margin-top: 26px;
    color: #94a3b8;
    font-size: 0.9rem;
}

.register-prompt a {
    color: #67e8f9;
    font-weight: 650;
    text-decoration: none;
}

.register-prompt a:hover {
    text-decoration: underline;
}

.auth-form :deep(input:-webkit-autofill),
.auth-form :deep(input:-webkit-autofill:hover),
.auth-form :deep(input:-webkit-autofill:focus),
.auth-form :deep(input:-webkit-autofill:active) {
    -webkit-box-shadow: 0 0 0 1000px #101c2d inset !important;
    -webkit-text-fill-color: #f8fafc !important;
    caret-color: #f8fafc;
}

@media (max-width: 480px) {
    .auth-card {
        padding: 6px;
    }

    .auth-header {
        padding: 24px 16px 10px;
    }

    .auth-form {
        padding: 18px 14px 22px;
    }

    .auth-title {
        font-size: 1.75rem;
    }
}
</style>
