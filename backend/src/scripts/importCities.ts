
/* Importe les villes GeoNames dans la base GeoWorld. */
import "reflect-metadata";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { AppDataSource } from "../data-source";
import { Country } from "../entity/Country";

async function importCities() {
    await AppDataSource.initialize();

    try {
        const filePath = join(__dirname, "cities15000.txt");
        const content = await readFile(filePath, "utf8");
        const lines = content.split(/\r?\n/);

        const countryRepository = AppDataSource.getRepository(Country);
        const countries = await countryRepository.find();

        const countryIds = new Map(
            countries
                .filter(country => country.iso_code_2)
                .map(country => [country.iso_code_2!.toUpperCase(), country.countryId])
        );

        const existingCount = await AppDataSource.query(
            "SELECT COUNT(*) AS total FROM city"
        );

        if (Number(existingCount[0].total) > 0) {
            throw new Error(
                "La table city contient déjà des données. Import annulé pour éviter les doublons."
            );
        }

        const batchSize = 500;
        let batch: Array<{
            name: string;
            population: number | null;
            latitude: number | null;
            longitude: number | null;
            countryId: number;
        }> = [];

        let imported = 0;
        let skipped = 0;

        for (const line of lines) {
            if (!line.trim()) continue;

            const fields = line.split("\t");

            const name = fields[1]?.trim();
            const latitude = Number(fields[4]);
            const longitude = Number(fields[5]);
            const featureClass = fields[6];
            const countryCode = fields[8]?.toUpperCase();
            const populationValue = Number(fields[14]);
            const countryId = countryIds.get(countryCode);

            if (
                !name ||
                featureClass !== "P" ||
                !countryId ||
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
            ) {
                skipped++;
                continue;
            }

            batch.push({
                name,
                population: Number.isSafeInteger(populationValue) && populationValue >= 0
                    ? populationValue
                    : null,
                latitude,
                longitude,
                countryId,
            });

            if (batch.length >= batchSize) {
                await insertBatch(batch);
                imported += batch.length;
                batch = [];
            }
        }

        if (batch.length > 0) {
            await insertBatch(batch);
            imported += batch.length;
        }

        console.log(`Import terminé : ${imported} villes importées.`);
        console.log(`${skipped} lignes ignorées.`);
    } finally {
        await AppDataSource.destroy();
    }
}

async function insertBatch(
    cities: Array<{
        name: string;
        population: number | null;
        latitude: number | null;
        longitude: number | null;
        countryId: number;
    }>
) {
    const placeholders = cities.map(() => "(?, ?, ?, ?, ?)").join(", ");
    const values = cities.flatMap(city => [
        city.name,
        city.population,
        city.latitude,
        city.longitude,
        city.countryId,
    ]);

    await AppDataSource.query(
        `INSERT INTO city (name_city, population, latitude, longitude, countryId)
         VALUES ${placeholders}`,
        values
    );
}

importCities().catch(error => {
    console.error("Erreur pendant l'import des villes :", error);
    process.exitCode = 1;
});
