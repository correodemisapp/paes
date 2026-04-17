import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    const dynamicQuestions = (await kv.get('custom_questions')) || [];
    return res.status(200).json({ questions: dynamicQuestions });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}