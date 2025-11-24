import { activities, detailprogramme, PrismaClient } from '@prisma/client';
import express from 'express';
import { detailprogrammEntry } from '../types/prismaEntry';

export const detailprogrammeRouter = express.Router();
const prisma = new PrismaClient();

function normalizeToArray(value: string | string[] | undefined): string[] {
        if (typeof value === 'undefined') {
                return [];
        }
        return Array.isArray(value) ? value : [value];
}

function mapDetailprogrammBody(
        body: any,
        currentDetailprogramm?: detailprogramm
): detailprogrammEntry {
        const {
                date,
                starttime,
                endtime,
                location,
                responsible,
                material,
                zeit,
                ablauf,
                activityId = currentDetailprogramm?.activityId,
                anschlagAbmeldenBis,
        } = body;

        return {
                date,
                starttime,
                endtime,
                location,
                responsible,
                material,
                zeit: normalizeToArray(zeit),
                ablauf: normalizeToArray(ablauf),
                AbmeldenBis: anschlagAbmeldenBis || currentDetailprogramm?.AbmeldenBis,
                activityId,
        } as detailprogrammEntry;
}

detailprogrammeRouter.get(
	'/',
	async function (req: express.Request, res: express.Response) {
		res.render('detailprogramme', {
			user: req.user,
			page: 'Detailprogramme',
			detailprogramme: await prisma.detailprogramme.findMany(),
		});
	}
);

detailprogrammeRouter.get(
	'/edit',
	async function (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
                let detailprogramm: detailprogramme = {} as detailprogramme;
                let activity: activities | null = null;

                if (req.query.activityId != undefined) {
                        activity = await prisma.activities.findUniqueOrThrow({
                                where: {
                                        id: req.query.activityId as string,
                                },
                        });
                }

                if (req.query.id != undefined) {
                        try {
                                detailprogramm = await prisma.detailprogramme.findUniqueOrThrow({
                                        where: {
                                                id: req.query.id as string,
                                        },
                                });
                        } catch (error) {
                                next(error);
                        }
                }
		res.render('editDetailprogramm', {
			user: req.user,
			page: 'Detailprogramme',
			detailprogramm: detailprogramm,
			activity: activity,
		});
	}
);
detailprogrammeRouter.post(
	'/create',
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
                try {
                        const detailprogrammEntry = mapDetailprogrammBody(req.body);

                        const newEntry: detailprogramme = await prisma.detailprogramme.create({
                                data: detailprogrammEntry,
                        });

			res.render('editDetailprogramm', {
				user: req.user,
				page: 'Detailprogramme',
				detailprogramm: await prisma.detailprogramme.findUniqueOrThrow({
					where: {
						id: newEntry.id,
					},
				}),
			});
		} catch (error) {
			next(error);
		}
	}
);
detailprogrammeRouter.post(
	'/edit',
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
                try {
                        const existingDetailprogramm = await prisma.detailprogramme.findUniqueOrThrow({
                                where: {
                                        id: req.query.id as string,
                                },
                        });

                        const detailprogrammEntry = mapDetailprogrammBody(
                                req.body,
                                existingDetailprogramm
                        );

                        await prisma.detailprogramme.update({
                                data: detailprogrammEntry,
                                where: {
                                        id: req.query.id as string,
                                },
                        });

                        res.render('editDetailprogramm', {
                                user: req.user,
                                page: 'Detailprogramme',
                                detailprogramm: await prisma.detailprogramme.findUniqueOrThrow({
                                        where: {
                                                id: req.query.id as string,
                                        },
                                }),
                        });
                } catch (error) {
                        next(error);
                }
        }
);
