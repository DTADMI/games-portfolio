"use client";

import React from "react";
import { SoundProvider } from "@games/shared";

type Props = {
  children: React.ReactNode;
};

export default function SoundRootProvider({ children }: Props) {
  return <SoundProvider>{children}</SoundProvider>;
}
