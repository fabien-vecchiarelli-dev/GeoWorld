
/* Effectue les requêtes vers le backend pour les pays, territoires et recherches. */

const API_URL = import.meta.env.VITE_APP_API_URL;

// Récupère un pays par son code ISO alpha-2.
export async function getCountryByIsoCode(isoCode) {
    try {
        const response = await fetch(
            `${API_URL}/country/iso2/${encodeURIComponent(isoCode)}`,
        );

        if (!response.ok) return null;

        const data = await response.json();
        if (data.status === 400) return null;

        return data;
    } catch (error) {
        console.error("Erreur lors de la récupération du pays :", error);
        return null;
    }
}

// Récupère un territoire par son code ISO alpha-2.
export async function getTerritoryByIsoCode(isoCode) {
    try {
        const response = await fetch(
            `${API_URL}/territory/iso2/${encodeURIComponent(isoCode)}`,
        );

        if (!response.ok) return null;

        const data = await response.json();
        if (data.status === 400) return null;

        return data;
    } catch (error) {
        console.error("Erreur lors de la récupération du territoire :", error);
        return null;
    }
}

// Recherche des pays ou des territoires.
export async function searchCountriesAndTerritories(query, type = "country") {
    try {
        const params = new URLSearchParams({ q: query, type });
        const response = await fetch(`${API_URL}/search?${params}`);

        if (!response.ok) {
            return { countries: [], territories: [] };
        }

        return await response.json();
    } catch (error) {
        console.error("Erreur pendant la recherche :", error);
        return { countries: [], territories: [] };
    }
}
