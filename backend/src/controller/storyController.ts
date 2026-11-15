/* Gère les requêtes HTTP liées à l'historique des quiz. */

import { NextFunction, Response } from "express";
import { getErrorMessage } from "../utils/errorUtils";
import { storyService } from "../service/storyService";
import { AuthRequest } from "../middleware/authMiddleware";

export class storyController {
    private StoryService = new storyService();

    // Récupère l'historique du joueur connecté.
    async all(request: AuthRequest, response: Response, next: NextFunction) {
        try {
            return await this.StoryService.all(request.user!.userId);
        } catch (error) {
            return getErrorMessage(error);
        }
    }

    // Récupère une partie du joueur connecté.
    async one(request: AuthRequest, response: Response, next: NextFunction) {
        try {
            const storyId = Number(request.params.storyId);
            if (!Number.isInteger(storyId) || storyId <= 0) {
                return response
                    .status(400)
                    .json({ message: "Identifiant invalide." });
            }
            const story = await this.StoryService.one(
                storyId,
                request.user!.userId,
            );

            if (!story) {
                return response.status(404).json({
                    message: "Partie introuvable.",
                });
            }

            return story;
        } catch (error) {
            return getErrorMessage(error);
        }
    }

    // Enregistre le résultat d'un quiz.
    async save(request: AuthRequest, response: Response, next: NextFunction) {
        try {
            const { score, date, categoryCode } = request.body;

            if (
                typeof score !== "number" ||
                !Number.isFinite(score) ||
                score < 0 ||
                typeof categoryCode !== "string"
            ) {
                return response.status(400).json({
                    message: "Score ou catégorie invalide.",
                });
            }

            const story = await this.StoryService.create(
                { score, date: date ? new Date(date) : new Date() },
                request.user!.userId,
                categoryCode,
            );

            return response.status(201).json(story);
        } catch (error) {
            return getErrorMessage(error);
        }
    }
}
