export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { prompt } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Chave de API não configurada na Vercel' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt não fornecido' });
  }

  try {
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      const errorMsg = data.error?.message || 'Erro na API do Gemini';
      return res.status(500).json({ error: errorMsg });
    }

    const textoGerado = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textoGerado) {
      return res.status(500).json({ error: 'A IA não retornou conteúdo válido.' });
    }

    return res.status(200).json({ resultado: textoGerado });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao conectar com a IA: ' + error.message });
  }
}