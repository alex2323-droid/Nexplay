import { GoogleGenAI } from '@google/genai';
import { dbStore } from '../store';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function askHermesAgent(userPrompt: string, history: { role: 'user' | 'model'; text: string }[] = []) {
  try {
    const gamesSummary = dbStore.games
      .filter(g => g.active)
      .map(g => `- ${g.name} (${g.category}): ID Requerido: ${g.playerFields.map(f => f.label).join(', ')}`)
      .join('\n');

    const activeOffers = dbStore.products
      .filter(p => p.active && p.isOffer)
      .map(p => `- ${p.name}: $${p.price} (Antes $${p.originalPrice}, Descuento: ${p.discountPercentage}%)`)
      .slice(0, 5)
      .join('\n');

    const systemInstruction = `
Eres "Hermes Agent", el asistente virtual oficial de NEXPLAY, la plataforma prémium de recargas digitales de videojuegos para gamers.
Tu personalidad es amable, directa, entusiasta con temática gamer, segura y servicial.

Información sobre NEXPLAY:
- Juegos disponibles principales: Blood Strike (Gold), Free Fire (Diamantes), Roblox (Robux). También PUBG Mobile, Mobile Legends, COD Mobile.
- Proceso de compra: Seleccionar juego -> Elegir paquete -> Ingresar ID de jugador/User ID -> Elegir método de pago -> Recarga automática inmediata.
- Métodos de pago aceptados: Tarjetas de crédito/débito, PayPal, Apple Pay, Google Pay, Criptomonedas, pagos locales en efectivo.
- Cupón de bienvenida activo: NEXPLAY10 (10% de descuento).
- Tiempo de entrega: 1 a 3 minutos promedio de forma automática directa a la cuenta del juego.
- Garantía: 100% segura por ID de jugador. Nunca se solicita contraseña de la cuenta.

Juegos destacados y campos:
${gamesSummary}

Ofertas destacadas actuales:
${activeOffers}

Instrucciones de respuesta:
1. Responde en español fluido y amable.
2. Si el usuario pregunta por dónde encontrar su User ID o Player ID en Blood Strike, Free Fire o Roblox, explícaselo paso a paso con claridad.
3. Si el usuario pregunta por ofertas o recomendaciones de recarga, menciónale los paquetes disponibles y el cupón NEXPLAY10.
4. Mantén las respuestas concisas, bien estructuradas y con tono gamer profesional.
`;

    // Format conversation history
    const formattedContents = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    formattedContents.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || 'Hola gamer! Soy Hermes-agent. ¿En qué te puedo ayudar hoy con tu recarga?';
  } catch (error: any) {
    console.error('Error in Hermes Agent Gemini API:', error);
    return '¡Hola! Soy Hermes-agent, el asistente de NEXPLAY. Actualmente estoy respondiendo en modo asistido. Puedes explorar nuestros juegos (Blood Strike, Free Fire, Roblox) o realizar tu recarga en la sección de juegos.';
  }
}
