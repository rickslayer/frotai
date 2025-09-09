'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/answer-fleet-question.ts';
import '@/ai/flows/summarize-chart-data.ts';
import '@/ai/flows/predict-parts-demand.ts';
