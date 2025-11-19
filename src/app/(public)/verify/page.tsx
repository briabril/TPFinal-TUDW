import React, { Suspense } from "react";
import VerifyClient from "./VerifyClient";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
      <VerifyClient />
    </Suspense>
  );
}
