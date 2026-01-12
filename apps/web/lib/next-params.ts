/**
 * Utility functions for handling Next.js 15+ params and searchParams
 * which are now Promises and must be unwrapped with React.use()
 * 
 * In Next.js 15+, params and searchParams are Promises in server components.
 * Use these utilities to unwrap them properly.
 */

import { use } from "react";

/**
 * Unwraps params Promise for use in server components
 * @example
 * export default async function Page({ params }: { params: Promise<{ id: string }> }) {
 *   const { id } = unwrapParams(params);
 *   // Use id...
 * }
 */
export function unwrapParams<T extends Record<string, string | string[]>>(
  params: Promise<T>
): T {
  return use(params);
}

/**
 * Unwraps searchParams Promise for use in server components
 * @example
 * export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
 *   const { q } = unwrapSearchParams(searchParams);
 *   // Use q...
 * }
 */
export function unwrapSearchParams<T extends Record<string, string | string[] | undefined>>(
  searchParams: Promise<T>
): T {
  return use(searchParams);
}

/**
 * Type helper for params in Next.js 15+
 */
export type PageProps<T extends Record<string, string | string[]>> = {
  params: Promise<T>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

