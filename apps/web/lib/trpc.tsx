"use client";

import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@pesapeak/trpc/routers/_app";

export const api = createTRPCReact<AppRouter>();
