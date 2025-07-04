import { Service, Config } from "@cmmv/core";

@Service()
export class GroqService {
    async generateContent(prompt: string) : Promise<string> {
        const groqApiKey = Config.get("blog.groqApiKey");
        const groqModel = Config.get("blog.groqModel", "DeepSeek-R1-Distill-Llama-70b");

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqApiKey || ''}`
            },
            body: JSON.stringify({
                model: groqModel,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 8000
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to generate AI content: ${error}`);
        }

        const groqResponse = await response.json();
        const generatedText = groqResponse.choices?.[0]?.message?.content;

        if (!generatedText)
            throw new Error('No content generated by Groq');

        return generatedText;
    }
} 