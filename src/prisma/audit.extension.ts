import { PrismaClient } from '@prisma/client';

export const auditExtension = (prisma: PrismaClient) => {
  return prisma.$extends({
    query: {
      $allModels: {
        async create({ args, query }) {
          args.data = { ...args.data, createdAt: new Date() };
          return query(args);
        },
        async update({ args, query }) {
          args.data = { ...args.data, updatedAt: new Date() };
          return query(args);
        },
      },
    },
  });
};
