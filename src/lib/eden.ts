import { treaty } from '@elysiajs/eden';
import type { app } from '@/app/api/[[...slugs]]/route';

// this require .api to enter /api prefix
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string;
export const api = treaty<app>(baseUrl).api;