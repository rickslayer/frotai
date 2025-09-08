'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/answer-fleet-question.ts';
import '@/ai/flows/summarize-chart-data.ts';
import '@/ai/flows/generate-initial-search-filters.ts';
