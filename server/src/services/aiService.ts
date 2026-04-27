import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateCaption = async (topic: string, platform: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a social media expert. Generate a catchy caption for ${platform} based on the topic provided.`
        },
        {
          role: "user",
          content: topic
        }
      ],
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    console.error('OpenAI Error:', error);
    throw new Error('Failed to generate caption');
  }
};

export const generateImage = async (prompt: string) => {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    return response.data[0].url;
  } catch (error: any) {
    console.error('DALL-E Error:', error);
    throw new Error('Failed to generate image');
  }
};
