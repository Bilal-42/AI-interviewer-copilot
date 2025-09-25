import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Directly fetch the token from the provided endpoint, no secret required
  const response = await fetch(
    'https://defaulta348b8b8a4654163859b9644d697c2.b6.environment.api.powerplatform.com/powervirtualagents/botsbyschema/cr0a0_agent3/directline/token?api-version=2022-03-01-preview',
    { method: 'POST' }
  );
  const data = await response.json();
  if (!response.ok) {
    return res.status(500).json({ error: data.error || 'Failed to fetch token' });
  }
  res.status(200).json({ token: data.token });
}
