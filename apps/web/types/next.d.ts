/**
 * Type definitions for Next.js 15+ params and searchParams
 * These are now Promises and must be unwrapped with React.use()
 * 
 * This file provides type helpers for working with Next.js 15+ async params/searchParams
 */

// Type helpers for Next.js 15+ page props
export type NextPageProps<
  TParams extends Record<string, string | string[]> = {},
  TSearchParams extends Record<string, string | string[] | undefined> = {}
> = {
  params: Promise<TParams>;
  searchParams?: Promise<TSearchParams>;
};

