import prisma from '../../prisma';

export default async () => await prisma.$queryRaw`SELECT 1`;
