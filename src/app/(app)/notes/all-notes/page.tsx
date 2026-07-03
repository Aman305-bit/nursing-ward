import { Suspense } from "react";

import { NotesPage } from "@/features/notes/notes-page";

export default function AllNotesRoute() {
  return (
    <Suspense fallback={<div className="py-6 text-sm text-muted-foreground">Loading notes...</div>}>
      <NotesPage />
    </Suspense>
  );
}
