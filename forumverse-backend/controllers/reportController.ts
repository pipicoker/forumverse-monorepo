import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createReportSchema } from '../middlewares/validator';
import { io } from '../index'; // Import the socket.io instance

const prisma = new PrismaClient();

// Create a report for a comment or post
export const createReport = async (req: Request, res: Response) => {
    try {
        const {reason, details, commentId, postId} = createReportSchema.parse(req.body);
        if (!reason || (!commentId && !postId)) {
            return res.status(400).json({ error: 'Reason and either commentId or postId are required' });
        }
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const report = await prisma.report.create({
            data: {
                reason,
                details: req.body.details || null,
                commentId: commentId || null,
                postId: postId || null,
                reporterId: userId,
                status: 'pending'
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                },
                comment: {
                    select: {
                        id: true,
                        content: true,
                        postId: true
                    }
                },
                post: {
                    select: {
                        id: true,
                        title: true,
                        content: true
                    }
                }
            }
        })
        // Emit a socket event for new report
        io.emit('newReport', report);
        
        res.status(201).json(report);
        
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
        
    }
}

// Get all reports
export const getAllReports = async (req: Request, res: Response) => {
    try {
        const reports = await prisma.report.findMany({
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                },
                comment: {
                    select: {
                        id: true,
                        content: true,
                        postId: true
                    }
                },
                post: {
                    select: {
                        id: true,
                        title: true,
                        content: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        res.json(reports);
        
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
        
    }
}

// Get a single report by ID
export const getSingleReport = async (req: Request, res: Response) => { 
    try {
        const report = await prisma.report.findUnique({
            where: { id: req.params.id },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                },
                comment: {
                    select: {
                        id: true,
                        content: true,
                        postId: true
                    }
                },
                post: {
                    select: {
                        id: true,
                        title: true,
                        content: true
                    }
                }
            }
        })
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}