import { redirect } from "next/navigation";

export default function NotesRoute() {
  redirect("/notes/all-notes");
}
