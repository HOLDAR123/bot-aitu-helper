import OpenAI from "openai";

export class OpenaiService {
  private openai: OpenAI;
  private readonly timeout = 30000; // 30 секунд

  constructor(apiKey: string) {
    if (!apiKey) {
      console.warn("OpenAI API ключ не предоставлен");
    }
    
    this.openai = new OpenAI({
      apiKey,
      timeout: this.timeout,
    });
  }

  async getAnswer(userMessage: string): Promise<string> {
    if (!userMessage || userMessage.trim().length === 0) {
      return "Пожалуйста, введите ваш вопрос.";
    }

    try {
      const systemPrompt = `
You are a smart and friendly assistant for applicants of ASTANA IT UNIVERSITY.
Сен — ASTANA IT UNIVERSITY-ге түсушілерге көмек көрсететін ақылды және сыпайы ассистентсің.
Ты — умный и вежливый помощник для абитуриентов ASTANA IT UNIVERSITY.

Your goal / Мақсатың / Твоя цель:
- Answer questions clearly, briefly, and helpfully.
- Сұрақтарға түсінікті, қысқа және пайдалы жауап бер.
- Отвечай понятно, кратко и по существу.
- Always reply in the same language the user used (Kazakh, Russian or English).
- Егер сұрақ AITU-ға қатысы болмаса — жауап беруден сыпайы бас тарт.
- Если вопрос не относится к AITU — мягко откажись отвечать.
- If the question is unrelated to AITU — politely decline to answer.

Possible topics / Мүмкін тақырыптар / Возможные темы:
- Grants / Гранттар / Гранты  
- Dormitory / Жатақхана / Общежитие  
- Admission / Құжаттар / Подача документов  
- Programs / Мамандықтар / Специальности  
- Student life / Студенттік өмір / Студенческая жизнь  

Here is a message from the applicant: "${userMessage}"
Please provide a helpful and polite answer in the same language.
`;

      const response = await Promise.race([
        this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.6,
          max_tokens: 1000,
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), this.timeout)
        )
      ]);

      const message = response.choices[0]?.message?.content;
      if (!message) {
        return "Извините, не удалось получить ответ от ИИ.";
      }

      return message.trim();
      
    } catch (error) {
      console.error("OpenAI error:", error);
      
      if (error instanceof Error) {
        if (error.message === 'Timeout') {
          return "Извините, ответ занимает слишком много времени. Попробуйте переформулировать вопрос.";
        }
        
        if (error.message.includes('401')) {
          return "Извините, проблема с доступом к ИИ. Обратитесь к администратору.";
        }
        
        if (error.message.includes('429')) {
          return "Извините, слишком много запросов. Попробуйте позже.";
        }
      }
      
      return "Извините, произошла ошибка при обращении к ИИ. Попробуйте позже.";
    }
  }
}
