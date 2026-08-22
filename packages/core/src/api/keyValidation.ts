// Key Validation Module
// Tests API keys against provider endpoints to verify validity

import { ApiProvider, ProviderConfig, ValidationResult } from './types.js';
import { getProviderConfig } from './providerConfigs.js';

/**
 * Validates an API key by making a test call to the provider's API
 */
export async function validateApiKey(
  provider: ApiProvider,
  apiKey: string,
  baseUrl?: string
): Promise<ValidationResult> {
  const config = getProviderConfig(provider);
  const effectiveBaseUrl = baseUrl || config.baseUrl;

  switch (provider) {
    case ApiProvider.OPENAI:
    case ApiProvider.GROQ:
    case ApiProvider.TOGETHER:
    case ApiProvider.OPENROUTER:
      return validateOpenAiCompatible(provider, apiKey, effectiveBaseUrl, config);
    case ApiProvider.ANTHROPIC:
      return validateAnthropic(apiKey, effectiveBaseUrl, config);
    case ApiProvider.GOOGLE:
      return validateGoogle(apiKey, effectiveBaseUrl, config);
    case ApiProvider.COHERE:
      return validateCohere(apiKey, effectiveBaseUrl, config);
    case ApiProvider.MISTRAL:
      return validateMistral(apiKey, effectiveBaseUrl, config);
    case ApiProvider.AZURE:
      return validateAzure(apiKey, baseUrl || '', config);
    default:
      return validateGeneric(provider, apiKey, effectiveBaseUrl, config);
  }
}

/**
 * Validate OpenAI-compatible providers (Groq, Together, OpenRouter, etc.)
 */
async function validateOpenAiCompatible(
  provider: ApiProvider,
  apiKey: string,
  baseUrl: string,
  config: ProviderConfig
): Promise<ValidationResult> {
  try {
    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return {
        valid: true,
        provider,
        message: 'API key is valid',
        validatedAt: new Date(),
      };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      valid: false,
      provider,
      message: errorData?.error?.message || `Validation failed with status ${response.status}`,
      details: { status: response.status, error: errorData },
      validatedAt: new Date(),
    };
  } catch (error: any) {
    return {
      valid: false,
      provider,
      message: `Network error: ${error.message}`,
      details: { error: error.message },
      validatedAt: new Date(),
    };
  }
}

/**
 * Validate Anthropic API key
 */
async function validateAnthropic(
  apiKey: string,
  baseUrl: string,
  config: ProviderConfig
): Promise<ValidationResult> {
  try {
    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    });

    // 400 is acceptable here — it means the key works but request was incomplete
    if (response.ok || response.status === 400) {
      return {
        valid: true,
        provider: ApiProvider.ANTHROPIC,
        message: 'API key is valid',
        validatedAt: new Date(),
      };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      valid: false,
      provider: ApiProvider.ANTHROPIC,
      message: errorData?.error?.message || `Validation failed with status ${response.status}`,
      details: { status: response.status, error: errorData },
      validatedAt: new Date(),
    };
  } catch (error: any) {
    return {
      valid: false,
      provider: ApiProvider.ANTHROPIC,
      message: `Network error: ${error.message}`,
      details: { error: error.message },
      validatedAt: new Date(),
    };
  }
}

/**
 * Validate Google AI (Gemini) API key
 */
async function validateGoogle(
  apiKey: string,
  baseUrl: string,
  config: ProviderConfig
): Promise<ValidationResult> {
  try {
    const response = await fetch(`${baseUrl}/models?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return {
        valid: true,
        provider: ApiProvider.GOOGLE,
        message: 'API key is valid',
        validatedAt: new Date(),
      };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      valid: false,
      provider: ApiProvider.GOOGLE,
      message: errorData?.error?.message || `Validation failed with status ${response.status}`,
      details: { status: response.status, error: errorData },
      validatedAt: new Date(),
    };
  } catch (error: any) {
    return {
      valid: false,
      provider: ApiProvider.GOOGLE,
      message: `Network error: ${error.message}`,
      details: { error: error.message },
      validatedAt: new Date(),
    };
  }
}

/**
 * Validate Cohere API key
 */
async function validateCohere(
  apiKey: string,
  baseUrl: string,
  config: ProviderConfig
): Promise<ValidationResult> {
  try {
    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return {
        valid: true,
        provider: ApiProvider.COHERE,
        message: 'API key is valid',
        validatedAt: new Date(),
      };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      valid: false,
      provider: ApiProvider.COHERE,
      message: errorData?.message || `Validation failed with status ${response.status}`,
      details: { status: response.status, error: errorData },
      validatedAt: new Date(),
    };
  } catch (error: any) {
    return {
      valid: false,
      provider: ApiProvider.COHERE,
      message: `Network error: ${error.message}`,
      details: { error: error.message },
      validatedAt: new Date(),
    };
  }
}

/**
 * Validate Mistral API key
 */
async function validateMistral(
  apiKey: string,
  baseUrl: string,
  config: ProviderConfig
): Promise<ValidationResult> {
  try {
    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return {
        valid: true,
        provider: ApiProvider.MISTRAL,
        message: 'API key is valid',
        validatedAt: new Date(),
      };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      valid: false,
      provider: ApiProvider.MISTRAL,
      message: errorData?.message || errorData?.error?.message || `Validation failed with status ${response.status}`,
      details: { status: response.status, error: errorData },
      validatedAt: new Date(),
    };
  } catch (error: any) {
    return {
      valid: false,
      provider: ApiProvider.MISTRAL,
      message: `Network error: ${error.message}`,
      details: { error: error.message },
      validatedAt: new Date(),
    };
  }
}

/**
 * Validate Azure OpenAI API key
 */
async function validateAzure(
  apiKey: string,
  baseUrl: string,
  config: ProviderConfig
): Promise<ValidationResult> {
  if (!baseUrl) {
    return {
      valid: false,
      provider: ApiProvider.AZURE,
      message: 'Azure OpenAI requires a custom base URL (your-resource.openai.azure.com)',
      validatedAt: new Date(),
    };
  }

  try {
    const response = await fetch(`https://${baseUrl}/openai/deployments?api-version=2024-02-01`, {
      method: 'GET',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return {
        valid: true,
        provider: ApiProvider.AZURE,
        message: 'API key is valid',
        validatedAt: new Date(),
      };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      valid: false,
      provider: ApiProvider.AZURE,
      message: errorData?.error?.message || `Validation failed with status ${response.status}`,
      details: { status: response.status, error: errorData },
      validatedAt: new Date(),
    };
  } catch (error: any) {
    return {
      valid: false,
      provider: ApiProvider.AZURE,
      message: `Network error: ${error.message}`,
      details: { error: error.message },
      validatedAt: new Date(),
    };
  }
}

/**
 * Generic validation using provider's configured endpoint
 */
async function validateGeneric(
  provider: ApiProvider,
  apiKey: string,
  baseUrl: string,
  config: ProviderConfig
): Promise<ValidationResult> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Set auth header based on config
    if (config.authHeader === 'Authorization') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      headers[config.authHeader] = apiKey;
    }

    const response = await fetch(`${baseUrl}${config.validationEndpoint}`, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      return {
        valid: true,
        provider,
        message: 'API key is valid',
        validatedAt: new Date(),
      };
    }

    return {
      valid: false,
      provider,
      message: `Validation failed with status ${response.status}`,
      details: { status: response.status },
      validatedAt: new Date(),
    };
  } catch (error: any) {
    return {
      valid: false,
      provider,
      message: `Network error: ${error.message}`,
      details: { error: error.message },
      validatedAt: new Date(),
    };
  }
}

/**
 * Validate API key format (basic pattern check without API call)
 */
export function validateKeyFormat(provider: ApiProvider, apiKey: string): { valid: boolean; message?: string } {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, message: 'API key cannot be empty' };
  }

  const config = getProviderConfig(provider);

  if (config.keyPrefix && !apiKey.startsWith(config.keyPrefix)) {
    return {
      valid: false,
      message: `${config.name} API keys typically start with "${config.keyPrefix}"`,
    };
  }

  // Minimum length check
  if (apiKey.length < 10) {
    return { valid: false, message: 'API key is too short' };
  }

  return { valid: true };
}

/**
 * Batch validate multiple API keys
 */
export async function validateMultipleKeys(
  keys: Array<{ provider: ApiProvider; key: string; baseUrl?: string }>
): Promise<ValidationResult[]> {
  return Promise.all(
    keys.map(({ provider, key, baseUrl }) => validateApiKey(provider, key, baseUrl))
  );
}