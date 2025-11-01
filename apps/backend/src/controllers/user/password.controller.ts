import bcrypt from "bcryptjs";
import { prisma } from "@/utils/prisma";

export const updatePassword = async ({ user, set, body }: any) => {
  if (!user) {
    set.status = 401;
    return { message: "Unauthorized" };
  }

  const { oldPassword, newPassword } = body;

  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!existingUser) {
    set.status = 404;
    return { message: "User not found" };
  }

  const isValid = await bcrypt.compare(oldPassword, existingUser.password);
  if (!isValid) {
    set.status = 403;
    return { message: "Old password is incorrect" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return { message: "Password updated successfully" };
};
