
/* Génère les questions GeoWorld avec des propositions adaptées à la difficulté. */

import { AppDataSource } from "../data-source";
import { Capital } from "../entity/Capital";
import { City } from "../entity/City";
import { Flag } from "../entity/Flag";
import { Money } from "../entity/Money";

type QuizzCategory = "CAPITALS" | "FLAGS" | "CURRENCIES";
type QuizzDifficulty = "easy" | "medium" | "hard";
type Region = "AFRICA" | "ASIA" | "EUROPE" | "NORTH_AMERICA" | "SOUTH_AMERICA" | "OCEANIA" | "OTHER";
type LocalityType = "CAPITAL" | "PRINCIPAL_CITY";

interface QuizzQuestion {
    question: string;
    correctAnswer: string;
    choices: string[];
    imageUrl: string | null;
}

interface QuizzItem {
    countryName: string;
    countryCode: string;
    region: Region;
    answer: string;
    imageUrl: string | null;
    localityType?: LocalityType;
    countryId?: number | null;
}

interface CityCandidate {
    name: string;
    population: number;
}

export class quizzService {
    private capitalRepository = AppDataSource.getRepository(Capital);
    private cityRepository = AppDataSource.getRepository(City);
    private flagRepository = AppDataSource.getRepository(Flag);
    private moneyRepository = AppDataSource.getRepository(Money);

    private shuffle<T>(items: T[]): T[] {
        const shuffled = [...items];

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }

    private normalize(name: string): string {
        return name.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[’‘`]/g, "'")
            .replace(/[.,]/g, "")
            .toLowerCase()
            .trim();
    }

    private uniqueAnswers(answers: string[]): string[] {
        const seen = new Set<string>();

        return answers.filter(answer => {
            const normalized = this.normalize(answer);

            if (!normalized || seen.has(normalized)) return false;

            seen.add(normalized);
            return true;
        });
    }

    // Exclut les territoires isolés ou inhabités peu pertinents pour les quiz.
    private isExcludedTerritory(name: string, code = ""): boolean {
        const excludedCodes = [
            "UM", // Îles mineures éloignées des États-Unis
            "AQ", // Antarctique
            "BV", // Île Bouvet
            "HM", // Îles Heard-et-MacDonald
            "IO", // Territoire britannique de l'océan Indien
            "TF", // Terres australes et antarctiques françaises
            "GS", // Géorgie du Sud et îles Sandwich du Sud
        ];

        const excludedNames = [
            "territoire britannique de l'ocean indien",
            "british indian ocean territory",
            "british indian ocean",
            "iles heard-et-macdonald",
            "heard island and mcdonald islands",
            "heard and mcdonald islands",
            "iles mineures eloignees des etats-unis",
            "united states minor outlying islands",
            "antarctique",
            "antarctica",
            "ile bouvet",
            "bouvet island",
            "terres australes et antarctiques francaises",
            "french southern territories",
            "georgie du sud et les iles sandwich du sud",
            "south georgia and the south sandwich islands",
        ];

        return excludedCodes.includes(code.toUpperCase())
            || excludedNames.includes(this.normalize(name));
    }

    // Privilégie le territoire lorsqu'il est renseigné.
    private getCountryName(item: {
        country?: { name_country: string } | null;
        territory?: { name_territory: string } | null;
    }): string | null {
        return item.territory?.name_territory
            || item.country?.name_country
            || null;
    }

    // La bonne réponse est le territoire ou le pays qui possède le drapeau.
    private getFlagAnswer(item: {
        country?: { name_country: string } | null;
        territory?: {
            name_territory: string;
            country?: { name_country: string } | null;
        } | null;
    }): string | null {
        return item.territory?.name_territory
            || item.country?.name_country
            || null;
    }

    // Utilise le code ISO de l'entité représentée.
    private getCountryCode(item: {
        country?: { iso_code_2?: string | null } | null;
        territory?: { iso_code_2?: string | null } | null;
    }): string {
        return item.territory?.iso_code_2
            || item.country?.iso_code_2
            || "";
    }

    private getRegion(code: string): Region {
        const regions: Record<Exclude<Region, "OTHER">, string[]> = {
            AFRICA: ["DZ", "AO", "BJ", "BW", "BF", "BI", "CV", "CM", "CF", "TD", "KM", "CG", "CD", "CI", "DJ", "EG", "GQ", "ER", "SZ", "ET", "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW", "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD", "TZ", "TG", "TN", "UG", "ZM", "ZW"],
            ASIA: ["AF", "AM", "AZ", "BH", "BD", "BT", "BN", "KH", "CN", "CY", "GE", "IN", "ID", "IR", "IQ", "IL", "JP", "JO", "KZ", "KW", "KG", "LA", "LB", "MY", "MV", "MN", "MM", "NP", "KP", "OM", "PK", "PS", "PH", "QA", "SA", "SG", "KR", "LK", "SY", "TW", "TJ", "TH", "TL", "TR", "TM", "AE", "UZ", "VN", "YE"],
            EUROPE: ["AL", "AD", "AT", "BY", "BE", "BA", "BG", "HR", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "MD", "MC", "ME", "NL", "MK", "NO", "PL", "PT", "RO", "RU", "SM", "RS", "SK", "SI", "ES", "SE", "CH", "UA", "GB", "VA", "XK", "SJ"],
            NORTH_AMERICA: ["AG", "BS", "BB", "BZ", "CA", "CR", "CU", "DM", "DO", "SV", "GD", "GT", "HT", "HN", "JM", "MX", "NI", "PA", "KN", "LC", "VC", "TT", "US", "PR", "GL", "BM", "KY", "GP", "MQ", "AW", "CW", "SX", "BQ", "AI", "VG", "VI", "MS", "TC", "BL", "MF"],
            SOUTH_AMERICA: ["AR", "BO", "BR", "CL", "CO", "EC", "GY", "PY", "PE", "SR", "UY", "VE", "GF", "FK"],
            OCEANIA: ["AU", "FJ", "KI", "MH", "FM", "NR", "NZ", "PW", "PG", "WS", "SB", "TO", "TV", "VU", "NC", "PF", "GU", "AS", "MP", "CK", "NU", "TK"],
        };

        for (const [region, codes] of Object.entries(regions)) {
            if (codes.includes(code.toUpperCase())) return region as Region;
        }

        return "OTHER";
    }

    private getWrongAnswers(
        item: QuizzItem,
        items: QuizzItem[],
        difficulty: QuizzDifficulty,
        citiesByCountry: Map<number, CityCandidate[]>,
        excludedLocalitiesByCountry: Map<number, Set<string>>,
    ): string[] {
        const isCapitalQuiz = item.localityType !== undefined;

        if (isCapitalQuiz && difficulty !== "easy") {
            if (item.countryId == null) return [];

            const excluded = excludedLocalitiesByCountry.get(item.countryId) || new Set<string>();
            const countryCities = citiesByCountry.get(item.countryId) || [];

            return this.uniqueAnswers(countryCities
                .filter(city => {
                    const normalized = this.normalize(city.name);
                    return normalized !== this.normalize(item.answer)
                        && !excluded.has(normalized);
                })
                .map(city => city.name))
                .slice(0, 3);
        }

        const available = this.uniqueAnswers(items.map(other => other.answer))
            .filter(answer => this.normalize(answer) !== this.normalize(item.answer));

        if (difficulty === "easy") {
            return this.shuffle(available).slice(0, 3);
        }

        const regionalCandidates = this.uniqueAnswers(items
            .filter(other => other.region === item.region)
            .map(other => other.answer))
            .filter(answer => this.normalize(answer) !== this.normalize(item.answer));

        if (difficulty === "medium") {
            let candidates = regionalCandidates;

            const similarLength = candidates.filter(answer =>
                Math.abs(answer.length - item.answer.length)
                <= Math.max(3, Math.floor(item.answer.length * 0.35))
            );

            if (similarLength.length >= 3) candidates = similarLength;

            if (candidates.length < 3) {
                candidates = this.uniqueAnswers([...candidates, ...available]);
            }

            return this.shuffle(candidates).slice(0, 3);
        }

        return this.shuffle(this.uniqueAnswers([...regionalCandidates, ...available]))
            .slice(0, 3);
    }

    async generate(category: QuizzCategory, difficulty: QuizzDifficulty): Promise<QuizzQuestion[]> {
        let items: QuizzItem[] = [];
        const citiesByCountry = new Map<number, CityCandidate[]>();
        const excludedLocalitiesByCountry = new Map<number, Set<string>>();

        if (category === "CAPITALS") {
            const localities = await this.capitalRepository.find({
                relations: { country: true, territory: { country: true } },
            });

            for (const locality of localities) {
                const countryId = locality.country?.countryId
                    ?? locality.territory?.country?.countryId;

                if (countryId == null || !locality.name_capital) continue;

                const excluded = excludedLocalitiesByCountry.get(countryId) || new Set<string>();
                excluded.add(this.normalize(locality.name_capital));
                excludedLocalitiesByCountry.set(countryId, excluded);
            }

            items = localities.map(item => {
                const subject = item.territory?.name_territory || item.country?.name_country || "";
                const countryCode = this.getCountryCode(item);

                return {
                    countryName: subject,
                    countryCode,
                    region: this.getRegion(countryCode),
                    answer: item.name_capital,
                    imageUrl: null,
                    localityType: item.localityType,
                    countryId: item.country?.countryId
                        ?? item.territory?.country?.countryId
                        ?? null,
                };
            }).filter(item =>
                item.countryName
                && item.answer
                && this.normalize(item.answer) !== "aucune capitale"
                && !this.isExcludedTerritory(item.countryName, item.countryCode)
            );

            if (difficulty !== "easy") {
                // Charge les villes une seule fois et les classe par population.
                const cities = await this.cityRepository.find({
                    select: {
                        cityId: true,
                        name_city: true,
                        population: true,
                        country: { countryId: true },
                    },
                    relations: { country: true },
                });

                for (const city of cities) {
                    const countryId = city.country?.countryId;
                    if (countryId == null || !city.name_city) continue;

                    const countryCities = citiesByCountry.get(countryId) || [];
                    countryCities.push({
                        name: city.name_city,
                        population: Number(city.population) || 0,
                    });
                    citiesByCountry.set(countryId, countryCities);
                }

                for (const countryCities of citiesByCountry.values()) {
                    countryCities.sort((a, b) => b.population - a.population);
                }
            }
        } else if (category === "FLAGS") {
            const flags = await this.flagRepository.find({
                relations: { country: true, territory: { country: true } },
            });

            items = flags.map(item => {
                const countryName = this.getCountryName(item) || "";
                const countryCode = this.getCountryCode(item);

                return {
                    countryName,
                    countryCode,
                    region: this.getRegion(countryCode),
                    answer: this.getFlagAnswer(item) || "",
                    imageUrl: item.picture_flag,
                };
            }).filter(item =>
                item.countryName
                && item.answer
                && item.imageUrl
                && !this.isExcludedTerritory(item.countryName, item.countryCode)
                && !this.isExcludedTerritory(item.answer)
            );
        } else if (category === "CURRENCIES") {
            const currencies = await this.moneyRepository.find({
                relations: ["country", "territory"],
            });

            items = currencies.map(item => {
                const countryName = this.getCountryName(item) || "";
                const countryCode = this.getCountryCode(item);

                return {
                    countryName,
                    countryCode,
                    region: this.getRegion(countryCode),
                    answer: item.name_money,
                    imageUrl: null,
                };
            }).filter(item =>
                item.countryName
                && item.answer
                && !this.isExcludedTerritory(item.countryName, item.countryCode)
            );
        } else {
            throw new Error("Catégorie de quiz invalide.");
        }

        const questionPool = items.filter((item, index, array) =>
            array.findIndex(other =>
                category === "FLAGS"
                    ? other.answer === item.answer && other.imageUrl === item.imageUrl
                    : other.countryName === item.countryName && other.answer === item.answer
            ) === index
        );

        const questionCount: Record<QuizzDifficulty, number> = {
            easy: 10,
            medium: 20,
            hard: 30,
        };

        const possibleQuestions = this.shuffle(questionPool).map(item => {
            const wrongAnswers = this.getWrongAnswers(
                item,
                questionPool,
                difficulty,
                citiesByCountry,
                excludedLocalitiesByCountry,
            );

            if (wrongAnswers.length < 3) return null;

            let question: string;

            if (category === "CAPITALS") {
                question = item.localityType === "PRINCIPAL_CITY"
                    ? `Quelle est la ville principale de ${item.countryName} ?`
                    : `Quelle est la capitale de ${item.countryName} ?`;
            } else if (category === "FLAGS") {
                question = "À quel pays ou territoire appartient ce drapeau ?";
            } else {
                question = `Quelle monnaie est utilisée en ${item.countryName} ?`;
            }

            return {
                question,
                correctAnswer: item.answer,
                choices: this.shuffle([item.answer, ...wrongAnswers]),
                imageUrl: item.imageUrl,
            };
        }).filter((question): question is QuizzQuestion => question !== null);

        if (possibleQuestions.length === 0) return [];

        const selectedQuestions = possibleQuestions.slice(0, questionCount[difficulty]);

        let index = 0;

        while (selectedQuestions.length < questionCount[difficulty]) {
            const question = possibleQuestions[index % possibleQuestions.length];

            selectedQuestions.push({
                ...question,
                choices: [...question.choices],
            });

            index++;
        }

        return this.shuffle(selectedQuestions);
    }
}