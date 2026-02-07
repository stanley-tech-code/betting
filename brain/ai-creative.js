import OpenAI from 'openai';
import chalk from 'chalk';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const CreativeGenerator = {
  /**
   * Generate fresh Sheng creatives
   */
  generateShengCreative: async (angle = 'generic') => {
    console.log(chalk.magenta(`   [🎨 AI] Generating '${angle}' creative...`));
    try {
      const prompt = `
                You are a Kenyan betting expert. Write 1 high-converting push notification ad in "Sheng" (Kenyan Slang).
                Target Audience: Young males 18-35 in Nairobi.
                Angle: ${angle.toUpperCase()} (Focus on ${getAngleDesc(angle)}).
                Format JSON: { "title": "...", "description": "...", "emojis": "..." }
                Constraints: Title < 30 chars, Desc < 45 chars. Urgent tone. Use emojis.
            `;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "You are a creative ad copywriter." }, { role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error(chalk.red("   [❌ AI] Gen Failed:"), error.message);
      return { title: "Aviator: 50 KES Free!", description: "Ingia ucheze sahii. Usichelewe!", emojis: "🚀💸" };
    }
  },

  /**
   * Rewrite an existing creative to improve it
   */
  rewriteCreative: async (currentTitle, currentDesc, feedback) => {
    console.log(chalk.magenta(`   [🎨 AI] Rewriting creative based on feedback: ${feedback}`));
    try {
      const prompt = `
                Rewrite this Kenyan ad to be better.
                Original Title: "${currentTitle}"
                Original Desc: "${currentDesc}"
                Goal: ${feedback}
                Language: Sheng. Keep it short.
                Format JSON: { "title": "...", "description": "...", "emojis": "..." }
            `;
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
      });
      return JSON.parse(completion.choices[0].message.content);
    } catch (e) {
      return { title: currentTitle, description: currentDesc, emojis: "🔄" };
    }
  }
};

function getAngleDesc(angle) {
  const map = {
    'fomo': 'Scarcity, urgency, "now or never"',
    'bonus': 'Free money, sign up bonus, 50 Bob match',
    'curiosity': 'Secret trick, hidden method, "Did you know?"',
    'insider': 'Leaked info, betting tip, sure bet'
  };
  return map[angle] || 'General excitement';
}
