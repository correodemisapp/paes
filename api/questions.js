import { kv } from '@vercel/kv';
import { STATIC_QUESTIONS } from '../data/constants'; // Donde tengas tus 10 iniciales

export default async function handler(req, res) {
  const dynamicQuestions = (await kv.get('custom_questions')) || [];
  
  // Devolvemos la unión de ambas
  return res.status(200).json([...STATIC_QUESTIONS, ...dynamicQuestions]);
}