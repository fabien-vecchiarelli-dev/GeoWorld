
/* Gère l'enregistrement et la récupération de l'historique des quiz. */

import { AppDataSource } from "../data-source";
import { Story } from "../entity/Story";
import { User } from "../entity/User";
import { Category } from "../entity/Category";
import { storyCreateInterface } from "../interface/storyInterface";

export class storyService {
    private storyRepository = AppDataSource.getRepository(Story);
    private userRepository = AppDataSource.getRepository(User);
    private categoryRepository = AppDataSource.getRepository(Category);

    // Récupère l'historique d'un utilisateur.
    async all(userId: number) {
        return await this.storyRepository.find({
            where: { user: { id: userId } },
            relations: { category: true },
            order: { date: "DESC" }
        });
    }

    // Récupère une partie appartenant à l'utilisateur.
    async one(storyId: number, userId: number) {
        return await this.storyRepository.findOne({
            where: {
                storyId,
                user: { id: userId }
            },
            relations: { category: true }
        });
    }

    // Enregistre une partie pour l'utilisateur connecté.
    async create(body: storyCreateInterface, userId: number, categoryCode: string) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new Error("Utilisateur introuvable.");

        const category = await this.categoryRepository.findOneBy({
            code_category: categoryCode
        });
        if (!category) throw new Error("Catégorie introuvable.");

        const story = this.storyRepository.create({
            score: body.score,
            date: body.date ?? new Date(),
            user,
            category
        });

        return await this.storyRepository.save(story);
    }
}
