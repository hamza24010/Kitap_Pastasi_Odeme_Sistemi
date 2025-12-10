import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Helper to get AI instance safely
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing for Gemini");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const GeminiService = {
  /**
   * Generates a creative description for a menu item.
   */
  generateProductDescription: async (productName: string, category: string): Promise<string> => {
    const ai = getAI();
    if (!ai) return "Yapay zeka anahtarı eksik.";

    try {
      const prompt = `
        "Kitap Pastası" adında edebi ve sıcak bir kafe için menü açıklaması yaz.
        Ürün Adı: ${productName}
        Kategori: ${category}
        
        Açıklama kısa (maksimum 2 cümle), iştah açıcı ve hafif edebi/kitaplarla ilgili bir dille olsun.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text.trim();
    } catch (error) {
      console.error("Gemini description error:", error);
      return "Otomatik açıklama oluşturulamadı.";
    }
  },

  /**
   * Suggests a "Book & Menu Item" pairing of the day based on current menu.
   */
  generateDailyPairing: async (products: Product[]): Promise<{ title: string; text: string }> => {
    const ai = getAI();
    if (!ai) return { title: "Hata", text: "API Anahtarı bulunamadı." };

    try {
      const menuList = products.map(p => p.name).join(", ");
      
      const prompt = `
        Aşağıdaki menüden bir ürün seç ve onu ünlü bir kitap veya yazarla eşleştirerek "Günün Önerisi" oluştur.
        Menü: ${menuList}
        
        Format JSON olmalı: { "title": "Başlık (Örn: Kahve ve Dostoyevski)", "text": "Kısa açıklama..." }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              text: { type: Type.STRING }
            },
            required: ['title', 'text']
          }
        }
      });
      
      const jsonStr = response.text.trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Gemini pairing error:", error);
      return { title: "Günün Önerisi", text: "Şu an öneri oluşturulamıyor, lütfen garsona sorunuz." };
    }
  }
};
