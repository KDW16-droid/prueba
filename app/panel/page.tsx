import { Suspense } from "react";
import { PanelApp } from "../ui/panel-app";

export default function PanelPage() {
  return (
    <Suspense fallback={null}>
      <PanelApp />
    </Suspense>
  );
}
