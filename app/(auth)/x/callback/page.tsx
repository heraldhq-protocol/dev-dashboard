import { Suspense } from "react";
import XCallbackClient from "./page.client";

export default function XCallbackPage() {
  return (
    <Suspense>
      <XCallbackClient />
    </Suspense>
  );
}
