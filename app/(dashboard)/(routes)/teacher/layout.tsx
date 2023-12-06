import { FC, ReactNode } from "react";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

type TeacherLayoutProps = {
  children: ReactNode;
};

const TeacherLayout: FC<TeacherLayoutProps> = ({ children }) => {
  const { userId } = auth();

  if (!isTeacher(userId)) {
    return redirect("/");
  }

  return <>{children}</>;
};

export default TeacherLayout;
