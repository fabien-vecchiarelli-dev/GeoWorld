
<!-- Affiche la structure générale de GeoWorld sans navbar sur les pages de connexion et de jeu. -->
<template>
    <v-app>
        <NavBar v-if="!pagesSansNavigation.includes($route.path)" />
        <router-view />
    </v-app>
</template>

<script setup>
import NavBar from "./components/NavBar.vue";

const pagesSansNavigation = [
    "/connexion",
    "/inscription",
    "/quizz/jeu",
];
</script>

<style>
body {
    margin: 0;
    padding: 0;
    font-family: "Archivo", sans-serif;
}

#app {
    min-height: 100vh;
}
</style>
