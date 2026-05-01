import { Request, Response } from 'express';
import { prisma } from '../index';

// Provider registry — defines what each AI provider supports
const PROVIDER_REGISTRY: Record<string, {
  name: string;
  capabilities: string[];
  defaultModel: string;
  defaultUrl: string;
  models: { id: string; name: string }[];
}> = {
  groq: {
    name: 'Groq',
    capabilities: ['text', 'code', 'caption', 'hashtag'],
    defaultModel: 'llama-3.3-70b-versatile',
    defaultUrl: 'https://api.groq.com/openai/v1/chat/completions',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Fast)' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B' },
    ],
  },
  pollinations: {
    name: 'Pollinations AI',
    capabilities: ['text', 'image', 'caption', 'hashtag', 'code'],
    defaultModel: 'flux',
    defaultUrl: 'https://image.pollinations.ai/prompt',
    models: [
      { id: 'flux', name: 'FLUX.1' },
      { id: 'turbo', name: 'Turbo' },
      { id: 'hd', name: 'HD Quality' },
    ],
  },
  openai: {
    name: 'OpenAI',
    capabilities: ['text', 'code', 'caption', 'image', 'hashtag'],
    defaultModel: 'gpt-4o',
    defaultUrl: 'https://api.openai.com/v1/chat/completions',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ],
  },
};

// GET /api/ai-providers — List all + available
export const listProviders = async (req: Request, res: Response) => {
  try {
    const connected = await prisma.aIProvider.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // Mask API keys
    const masked = connected.map((p) => ({
      ...p,
      apiKey: p.apiKey ? `${p.apiKey.slice(0, 8)}...${p.apiKey.slice(-4)}` : '',
    }));

    res.json({ connected: masked, registry: PROVIDER_REGISTRY });
  } catch (error) {
    console.error('List providers error:', error);
    res.status(500).json({ message: 'Failed to fetch providers' });
  }
};

// POST /api/ai-providers — Connect new provider
export const connectProvider = async (req: Request, res: Response) => {
  try {
    const { slug, apiKey, model } = req.body;
    if (!slug || !apiKey) {
      return res.status(400).json({ message: 'Provider slug and API key are required' });
    }

    const registry = PROVIDER_REGISTRY[slug];
    if (!registry) {
      return res.status(400).json({ message: `Unknown provider: ${slug}` });
    }

    // Upsert — update if exists, create if not
    const provider = await prisma.aIProvider.upsert({
      where: { slug },
      update: {
        apiKey,
        model: model || registry.defaultModel,
        isVerified: false,
        updatedAt: new Date(),
      },
      create: {
        name: registry.name,
        slug,
        apiKey,
        apiUrl: registry.defaultUrl,
        model: model || registry.defaultModel,
        capabilities: registry.capabilities,
        isEnabled: true,
        isVerified: false,
      },
    });

    res.json({
      message: `${registry.name} connected successfully`,
      provider: { ...provider, apiKey: `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}` },
    });
  } catch (error) {
    console.error('Connect provider error:', error);
    res.status(500).json({ message: 'Failed to connect provider' });
  }
};

// POST /api/ai-providers/:slug/test — Test a provider
export const testProvider = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const provider = await prisma.aIProvider.findUnique({ where: { slug } });
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    let success = false;
    let responseText = '';
    let errorMsg = '';

    if (slug === 'groq' || slug === 'openai') {
      // OpenAI-compatible test
      const apiUrl = provider.apiUrl || PROVIDER_REGISTRY[slug]?.defaultUrl;
      try {
        const response = await fetch(apiUrl!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey}`,
          },
          body: JSON.stringify({
            model: provider.model || PROVIDER_REGISTRY[slug]?.defaultModel,
            messages: [{ role: 'user', content: 'Say "AI Connected Successfully!" in exactly 5 words.' }],
            max_tokens: 30,
            temperature: 0.3,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          responseText = data.choices?.[0]?.message?.content || 'OK';
          success = true;
        } else {
          const err = await response.json();
          errorMsg = err.error?.message || `HTTP ${response.status}`;
        }
      } catch (e: any) {
        errorMsg = e.message || 'Connection failed';
      }
    } else if (slug === 'pollinations') {
      // Pollinations AI test — check image endpoint
      try {
        const response = await fetch('https://image.pollinations.ai/models');
        if (response.ok) {
          const models = await response.json();
          responseText = `Connected! ${Array.isArray(models) ? models.length : 'Multiple'} models available.`;
          success = true;
        } else {
          errorMsg = `HTTP ${response.status}`;
        }
      } catch (e: any) {
        errorMsg = e.message || 'Connection failed';
      }
    }

    // Update verified status
    await prisma.aIProvider.update({
      where: { slug },
      data: {
        isVerified: success,
        lastTestedAt: new Date(),
      },
    });

    if (success) {
      res.json({ success: true, message: responseText });
    } else {
      res.status(400).json({ success: false, message: errorMsg });
    }
  } catch (error) {
    console.error('Test provider error:', error);
    res.status(500).json({ success: false, message: 'Test failed' });
  }
};

// PUT /api/ai-providers/:slug — Update provider
export const updateProvider = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { model, isEnabled, apiKey } = req.body;

    const updateData: any = {};
    if (model !== undefined) updateData.model = model;
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
    if (apiKey) {
      updateData.apiKey = apiKey;
      updateData.isVerified = false; // Re-verify when key changes
    }

    const provider = await prisma.aIProvider.update({
      where: { slug },
      data: updateData,
    });

    res.json({
      message: 'Provider updated',
      provider: { ...provider, apiKey: `${provider.apiKey.slice(0, 8)}...${provider.apiKey.slice(-4)}` },
    });
  } catch (error) {
    console.error('Update provider error:', error);
    res.status(500).json({ message: 'Failed to update provider' });
  }
};

// DELETE /api/ai-providers/:slug — Disconnect provider
export const disconnectProvider = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    await prisma.aIProvider.delete({ where: { slug } });
    res.json({ message: 'Provider disconnected' });
  } catch (error) {
    console.error('Disconnect provider error:', error);
    res.status(500).json({ message: 'Failed to disconnect provider' });
  }
};

// POST /api/ai-providers/generate — Generate content using connected AI
export const generateContent = async (req: Request, res: Response) => {
  try {
    const { prompt, type = 'caption', providerSlug } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    // Find the best provider for this task
    let provider;
    
    // Check if Groq is requested specifically for content/hashtags
    if (!providerSlug && (type === 'caption' || type === 'hashtag' || type === 'description')) {
      provider = await prisma.aIProvider.findFirst({
        where: {
          slug: 'groq',
          isEnabled: true,
          isVerified: true
        }
      });
    }

    if (!provider && providerSlug) {
      provider = await prisma.aIProvider.findUnique({ where: { slug: providerSlug } });
    }
    
    if (!provider) {
      // Auto-select: find enabled & verified provider with matching capability
      const capability = type === 'image' ? 'image' : 'text';
      provider = await prisma.aIProvider.findFirst({
        where: {
          isEnabled: true,
          isVerified: true,
          capabilities: { has: capability },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    if (!provider) {
      return res.status(400).json({ message: 'No AI provider configured for this task. Connect one in AI Settings.' });
    }

    if (type === 'image') {
      // Only Pollinations AI for image generation
      if (provider.slug !== 'pollinations') {
        return res.status(400).json({ message: 'Image generation is only available with Pollinations AI. Please connect Pollinations AI in AI Settings.' });
      }

      // Check for base64 image reference (image-to-image generation)
      const { referenceImage } = req.body;
      const maxRetries = 3;
      let attempt = 0;
      let lastError: any;

      while (attempt < maxRetries) {
        try {
          const encodedPrompt = encodeURIComponent(prompt);
          const model = provider.model || 'flux';
          const seed = Math.floor(Math.random() * 1000000);
          
          // Build base URL
          let imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${model}&width=1024&height=1024&nologo=true&seed=${seed}`;

          // If user provided a reference image, use POST method with form data
          // Otherwise use simple GET request
          let response;
          
          if (referenceImage && referenceImage.startsWith('data:image')) {
            // For image-to-image, use POST to avoid 431 error (URL too long)
            const base64Data = referenceImage.split(',')[1];
            const binaryData = Buffer.from(base64Data, 'base64');
            
            // Create form data
            const formData = new FormData();
            formData.append('image', new Blob([binaryData], { type: 'image/png' }));
            
            response = await fetch(imageUrl, {
              method: 'POST',
              body: formData,
            });
          } else {
            // Simple text-to-image generation
            response = await fetch(imageUrl);
          }

          if (response.status === 429) {
            // Rate limited - wait and retry with exponential backoff
            const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
            console.log(`Rate limited by Pollinations, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            attempt++;
            lastError = new Error('Rate limited (429)');
            continue;
          }

          if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ message: `Image generation failed: ${errText || `HTTP ${response.status}`}` });
          }

          const imageBuffer = await response.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          const dataUrl = `data:image/png;base64,${base64Image}`;

          // Update usage
          const user = (req as any).user;
          await prisma.user.update({ where: { id: user.userId }, data: { aiUsageCount: { increment: 1 } } });

          return res.json({ type: 'image', content: dataUrl, provider: provider.name });
        } catch (e: any) {
          lastError = e;
          if (attempt < maxRetries - 1) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          attempt++;
        }
      }

      // All retries failed
      return res.status(429).json({
        message: 'Image generation service is busy. Please wait a moment and try again.',
        error: lastError?.message || 'Too many requests after retries'
      });
    } else if (type === 'text' && provider.slug === 'pollinations') {
      // Pollinations AI text generation
      try {
        const encodedPrompt = encodeURIComponent(prompt);
        const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}?seed=42&json=false`);

        if (!response.ok) {
          return res.status(response.status).json({ message: `Text generation failed: HTTP ${response.status}` });
        }

        const content = await response.text();

        // Update usage
        const user = (req as any).user;
        await prisma.user.update({ where: { id: user.userId }, data: { aiUsageCount: { increment: 1 } } });

        return res.json({ type: 'text', content, provider: provider.name });
      } catch (e: any) {
        return res.status(500).json({ message: 'Text generation failed', error: e.message });
      }
    } else {
      // Text generation (Groq / OpenAI compatible)
      const { tone = 'engaging', audience = 'general', language = 'english' } = req.body.config || {};
      
      const systemPrompts: Record<string, string> = {
        caption: `You are a social media expert. Generate an engaging, creative caption for a social media post. 
        Include relevant emojis and hashtags. 
        Tone: ${tone}. 
        Target Audience: ${audience}. 
        Language: ${language}.
        Keep it concise and compelling.`,
        hashtag: `You are a social media expert. Generate 10-15 relevant, trending hashtags for the given topic. 
        Target Audience: ${audience}.
        Return only hashtags separated by spaces.`,
        description: `You are a content writer. Write a detailed, engaging description for the given topic. 
        Tone: ${tone}. 
        Target Audience: ${audience}. 
        Language: ${language}.
        Make it informative and appealing.`,
        code: 'You are a helpful coding assistant. Provide clean, well-commented code.',
        general: `You are a helpful AI assistant. 
        Tone: ${tone}. 
        Language: ${language}.
        Provide a clear, useful response.`,
      };

      const apiUrl = provider.apiUrl || PROVIDER_REGISTRY[provider.slug]?.defaultUrl;
      const response = await fetch(apiUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model: provider.model || PROVIDER_REGISTRY[provider.slug]?.defaultModel,
          messages: [
            { role: 'system', content: systemPrompts[type] || systemPrompts.general },
            { role: 'user', content: prompt },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = 'Generation failed';
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.error?.message || errJson.message || errText;
        } catch (e) {
          errMsg = errText || `HTTP ${response.status}`;
        }
        return res.status(response.status).json({ message: errMsg, detail: errText });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // Update usage
      const user = (req as any).user;
      await prisma.user.update({ where: { id: user.userId }, data: { aiUsageCount: { increment: 1 } } });

      return res.json({ type: 'text', content, provider: provider.name, model: provider.model });
    }
  } catch (error: any) {
    console.error('Generate content error:', error);
    res.status(500).json({ 
      message: 'Content generation failed', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};
