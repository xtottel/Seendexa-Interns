import { prisma } from "@/utils/prisma";

export const getProfile = async ({ user, set }: any) => {
  if (!user) {
    set.status = 401;
    return { message: "Unauthorized" };
  }
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!userData) {
    set.status = 404;
    return { message: "User not found" };
  }
  // Remove password before returning
  const { password, ...safeUser } = userData;

  return safeUser;
};

export const updateProfile = async ({ user, set, data }: any) => {
  if (!user) {
    set.status = 401;
    return { message: "Unauthorized" };
  }

  const { password, ...updateData } = data; // exclude password

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  const { password: _pw, ...safeUser } = updatedUser;
  return safeUser;
};
