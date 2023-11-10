import type { User } from "@clerk/nextjs/dist/types/server";

export const clientUserFilter = (user: User) => {
    return { id: user.id, username: user.username, imageUrl: user.imageUrl };
  };