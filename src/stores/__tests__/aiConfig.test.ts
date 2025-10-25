/**
 * AI Config Store Tests
 * Tests for AI configuration store actions, validation, and localStorage persistence
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAIConfigStore } from '../aiConfig';
import { clearStoreStorage } from './utils';

describe('AI Config Store', () => {
  beforeEach(() => {
    // Clear store and localStorage before each test
    clearStoreStorage();
    useAIConfigStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have default provider as "none"', () => {
      const store = useAIConfigStore.getState();
      expect(store.provider).toBe('none');
    });

    it('should have empty API key', () => {
      const store = useAIConfigStore.getState();
      expect(store.apiKey).toBe('');
    });

    it('should have empty model', () => {
      const store = useAIConfigStore.getState();
      expect(store.model).toBe('');
    });

    it('should have default temperature of 0.7', () => {
      const store = useAIConfigStore.getState();
      expect(store.temperature).toBe(0.7);
    });

    it('should have default maxTokens of 1000', () => {
      const store = useAIConfigStore.getState();
      expect(store.maxTokens).toBe(1000);
    });

    it('should be disabled by default', () => {
      const store = useAIConfigStore.getState();
      expect(store.enabled).toBe(false);
    });
  });

  describe('setProvider', () => {
    it('should set OpenAI provider', () => {
      const store = useAIConfigStore.getState();
      store.setProvider('openai');

      expect(useAIConfigStore.getState().provider).toBe('openai');
    });

    it('should set Anthropic provider', () => {
      const store = useAIConfigStore.getState();
      store.setProvider('anthropic');

      expect(useAIConfigStore.getState().provider).toBe('anthropic');
    });

    it('should set Google provider', () => {
      const store = useAIConfigStore.getState();
      store.setProvider('google');

      expect(useAIConfigStore.getState().provider).toBe('google');
    });

    it('should set local provider', () => {
      const store = useAIConfigStore.getState();
      store.setProvider('local');

      expect(useAIConfigStore.getState().provider).toBe('local');
    });

    it('should set provider back to none', () => {
      const store = useAIConfigStore.getState();
      store.setProvider('openai');
      store.setProvider('none');

      expect(useAIConfigStore.getState().provider).toBe('none');
    });

    it('should allow switching between providers', () => {
      const store = useAIConfigStore.getState();
      store.setProvider('openai');
      expect(useAIConfigStore.getState().provider).toBe('openai');

      store.setProvider('anthropic');
      expect(useAIConfigStore.getState().provider).toBe('anthropic');

      store.setProvider('google');
      expect(useAIConfigStore.getState().provider).toBe('google');
    });
  });

  describe('setApiKey', () => {
    it('should set API key', () => {
      const store = useAIConfigStore.getState();
      store.setApiKey('sk-test-key-123');

      expect(useAIConfigStore.getState().apiKey).toBe('sk-test-key-123');
    });

    it('should update existing API key', () => {
      const store = useAIConfigStore.getState();
      store.setApiKey('old-key');
      store.setApiKey('new-key');

      expect(useAIConfigStore.getState().apiKey).toBe('new-key');
    });

    it('should allow clearing API key', () => {
      const store = useAIConfigStore.getState();
      store.setApiKey('some-key');
      store.setApiKey('');

      expect(useAIConfigStore.getState().apiKey).toBe('');
    });

    it('should handle long API keys', () => {
      const store = useAIConfigStore.getState();
      const longKey = 'sk-' + 'x'.repeat(100);
      store.setApiKey(longKey);

      expect(useAIConfigStore.getState().apiKey).toBe(longKey);
    });
  });

  describe('setModel', () => {
    it('should set model name', () => {
      const store = useAIConfigStore.getState();
      store.setModel('gpt-4');

      expect(useAIConfigStore.getState().model).toBe('gpt-4');
    });

    it('should update existing model', () => {
      const store = useAIConfigStore.getState();
      store.setModel('gpt-3.5-turbo');
      store.setModel('gpt-4-turbo');

      expect(useAIConfigStore.getState().model).toBe('gpt-4-turbo');
    });

    it('should handle different model formats', () => {
      const store = useAIConfigStore.getState();

      store.setModel('claude-3-opus-20240229');
      expect(useAIConfigStore.getState().model).toBe('claude-3-opus-20240229');

      store.setModel('gemini-pro');
      expect(useAIConfigStore.getState().model).toBe('gemini-pro');
    });

    it('should allow clearing model', () => {
      const store = useAIConfigStore.getState();
      store.setModel('gpt-4');
      store.setModel('');

      expect(useAIConfigStore.getState().model).toBe('');
    });
  });

  describe('setTemperature', () => {
    it('should set temperature value', () => {
      const store = useAIConfigStore.getState();
      store.setTemperature(1.0);

      expect(useAIConfigStore.getState().temperature).toBe(1.0);
    });

    it('should clamp temperature to minimum of 0', () => {
      const store = useAIConfigStore.getState();
      store.setTemperature(-0.5);

      expect(useAIConfigStore.getState().temperature).toBe(0);
    });

    it('should clamp temperature to maximum of 2', () => {
      const store = useAIConfigStore.getState();
      store.setTemperature(3.0);

      expect(useAIConfigStore.getState().temperature).toBe(2);
    });

    it('should allow temperature at lower boundary (0)', () => {
      const store = useAIConfigStore.getState();
      store.setTemperature(0);

      expect(useAIConfigStore.getState().temperature).toBe(0);
    });

    it('should allow temperature at upper boundary (2)', () => {
      const store = useAIConfigStore.getState();
      store.setTemperature(2);

      expect(useAIConfigStore.getState().temperature).toBe(2);
    });

    it('should handle decimal temperature values', () => {
      const store = useAIConfigStore.getState();
      store.setTemperature(0.85);

      expect(useAIConfigStore.getState().temperature).toBe(0.85);
    });

    it('should handle very negative values', () => {
      const store = useAIConfigStore.getState();
      store.setTemperature(-100);

      expect(useAIConfigStore.getState().temperature).toBe(0);
    });

    it('should handle very large values', () => {
      const store = useAIConfigStore.getState();
      store.setTemperature(100);

      expect(useAIConfigStore.getState().temperature).toBe(2);
    });
  });

  describe('setMaxTokens', () => {
    it('should set max tokens value', () => {
      const store = useAIConfigStore.getState();
      store.setMaxTokens(2000);

      expect(useAIConfigStore.getState().maxTokens).toBe(2000);
    });

    it('should ensure minimum value of 1', () => {
      const store = useAIConfigStore.getState();
      store.setMaxTokens(0);

      expect(useAIConfigStore.getState().maxTokens).toBe(1);
    });

    it('should ensure positive value for negative input', () => {
      const store = useAIConfigStore.getState();
      store.setMaxTokens(-500);

      expect(useAIConfigStore.getState().maxTokens).toBe(1);
    });

    it('should allow setting to 1', () => {
      const store = useAIConfigStore.getState();
      store.setMaxTokens(1);

      expect(useAIConfigStore.getState().maxTokens).toBe(1);
    });

    it('should handle large token values', () => {
      const store = useAIConfigStore.getState();
      store.setMaxTokens(128000);

      expect(useAIConfigStore.getState().maxTokens).toBe(128000);
    });

    it('should update existing max tokens', () => {
      const store = useAIConfigStore.getState();
      store.setMaxTokens(1000);
      store.setMaxTokens(4000);

      expect(useAIConfigStore.getState().maxTokens).toBe(4000);
    });
  });

  describe('toggleEnabled', () => {
    it('should toggle enabled from false to true', () => {
      const store = useAIConfigStore.getState();
      expect(store.enabled).toBe(false);

      store.toggleEnabled();
      expect(useAIConfigStore.getState().enabled).toBe(true);
    });

    it('should toggle enabled from true to false', () => {
      const store = useAIConfigStore.getState();
      store.toggleEnabled(); // true
      store.toggleEnabled(); // false

      expect(useAIConfigStore.getState().enabled).toBe(false);
    });

    it('should toggle multiple times', () => {
      const store = useAIConfigStore.getState();

      for (let i = 0; i < 10; i++) {
        store.toggleEnabled();
        expect(useAIConfigStore.getState().enabled).toBe(i % 2 === 0);
      }
    });
  });

  describe('reset', () => {
    beforeEach(() => {
      // Setup: Configure store with non-default values
      const store = useAIConfigStore.getState();
      store.setProvider('openai');
      store.setApiKey('sk-test-key');
      store.setModel('gpt-4');
      store.setTemperature(1.5);
      store.setMaxTokens(4000);
      store.toggleEnabled();
    });

    it('should reset provider to none', () => {
      const store = useAIConfigStore.getState();
      store.reset();

      expect(useAIConfigStore.getState().provider).toBe('none');
    });

    it('should reset API key to empty string', () => {
      const store = useAIConfigStore.getState();
      store.reset();

      expect(useAIConfigStore.getState().apiKey).toBe('');
    });

    it('should reset model to empty string', () => {
      const store = useAIConfigStore.getState();
      store.reset();

      expect(useAIConfigStore.getState().model).toBe('');
    });

    it('should reset temperature to 0.7', () => {
      const store = useAIConfigStore.getState();
      store.reset();

      expect(useAIConfigStore.getState().temperature).toBe(0.7);
    });

    it('should reset maxTokens to 1000', () => {
      const store = useAIConfigStore.getState();
      store.reset();

      expect(useAIConfigStore.getState().maxTokens).toBe(1000);
    });

    it('should reset enabled to false', () => {
      const store = useAIConfigStore.getState();
      store.reset();

      expect(useAIConfigStore.getState().enabled).toBe(false);
    });

    it('should reset all fields at once', () => {
      const store = useAIConfigStore.getState();
      store.reset();

      const state = useAIConfigStore.getState();
      expect(state).toEqual({
        provider: 'none',
        apiKey: '',
        model: '',
        temperature: 0.7,
        maxTokens: 1000,
        enabled: false,
        setProvider: expect.any(Function),
        setApiKey: expect.any(Function),
        setModel: expect.any(Function),
        setTemperature: expect.any(Function),
        setMaxTokens: expect.any(Function),
        toggleEnabled: expect.any(Function),
        reset: expect.any(Function),
      });
    });

    it('should allow reconfiguration after reset', () => {
      const store = useAIConfigStore.getState();
      store.reset();
      store.setProvider('anthropic');
      store.setModel('claude-3-opus');

      const state = useAIConfigStore.getState();
      expect(state.provider).toBe('anthropic');
      expect(state.model).toBe('claude-3-opus');
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist configuration to localStorage', () => {
      const store = useAIConfigStore.getState();
      store.setProvider('openai');
      store.setApiKey('sk-test-key');
      store.setModel('gpt-4');

      // Check localStorage
      const stored = localStorage.getItem('ai-config');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.provider).toBe('openai');
      expect(parsed.state.apiKey).toBe('sk-test-key');
      expect(parsed.state.model).toBe('gpt-4');
    });

    it('should persist temperature changes', () => {
      const store = useAIConfigStore.getState();
      store.setTemperature(1.2);

      const stored = localStorage.getItem('ai-config');
      const parsed = JSON.parse(stored!);
      expect(parsed.state.temperature).toBe(1.2);
    });

    it('should persist maxTokens changes', () => {
      const store = useAIConfigStore.getState();
      store.setMaxTokens(4000);

      const stored = localStorage.getItem('ai-config');
      const parsed = JSON.parse(stored!);
      expect(parsed.state.maxTokens).toBe(4000);
    });

    it('should persist enabled state', () => {
      const store = useAIConfigStore.getState();
      store.toggleEnabled();

      const stored = localStorage.getItem('ai-config');
      const parsed = JSON.parse(stored!);
      expect(parsed.state.enabled).toBe(true);
    });

    it('should persist after reset', () => {
      const store = useAIConfigStore.getState();
      store.setProvider('openai');
      store.reset();

      const stored = localStorage.getItem('ai-config');
      const parsed = JSON.parse(stored!);
      expect(parsed.state.provider).toBe('none');
    });

    it('should use correct storage key name', () => {
      const store = useAIConfigStore.getState();
      store.setProvider('openai');

      // Verify key exists
      const key = 'ai-config';
      expect(localStorage.getItem(key)).not.toBeNull();
    });
  });

  describe('Integration Scenarios', () => {
    it('should configure complete OpenAI setup', () => {
      const store = useAIConfigStore.getState();

      store.setProvider('openai');
      store.setApiKey('sk-test-openai-key');
      store.setModel('gpt-4-turbo');
      store.setTemperature(0.8);
      store.setMaxTokens(2000);
      store.toggleEnabled();

      const state = useAIConfigStore.getState();
      expect(state.provider).toBe('openai');
      expect(state.apiKey).toBe('sk-test-openai-key');
      expect(state.model).toBe('gpt-4-turbo');
      expect(state.temperature).toBe(0.8);
      expect(state.maxTokens).toBe(2000);
      expect(state.enabled).toBe(true);
    });

    it('should configure complete Anthropic setup', () => {
      const store = useAIConfigStore.getState();

      store.setProvider('anthropic');
      store.setApiKey('sk-ant-test-key');
      store.setModel('claude-3-opus-20240229');
      store.setTemperature(1.0);
      store.setMaxTokens(4096);
      store.toggleEnabled();

      const state = useAIConfigStore.getState();
      expect(state.provider).toBe('anthropic');
      expect(state.model).toBe('claude-3-opus-20240229');
    });

    it('should switch providers without losing other settings', () => {
      const store = useAIConfigStore.getState();

      store.setProvider('openai');
      store.setTemperature(0.9);
      store.setMaxTokens(3000);

      store.setProvider('anthropic');

      const state = useAIConfigStore.getState();
      expect(state.provider).toBe('anthropic');
      expect(state.temperature).toBe(0.9); // Preserved
      expect(state.maxTokens).toBe(3000); // Preserved
    });

    it('should handle disable/enable workflow', () => {
      const store = useAIConfigStore.getState();

      // Configure and enable
      store.setProvider('openai');
      store.setApiKey('sk-test-key');
      store.toggleEnabled();
      expect(useAIConfigStore.getState().enabled).toBe(true);

      // Disable
      store.toggleEnabled();
      expect(useAIConfigStore.getState().enabled).toBe(false);

      // Configuration should still be there
      expect(useAIConfigStore.getState().provider).toBe('openai');
      expect(useAIConfigStore.getState().apiKey).toBe('sk-test-key');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string API key', () => {
      const store = useAIConfigStore.getState();
      store.setApiKey('');

      expect(useAIConfigStore.getState().apiKey).toBe('');
    });

    it('should handle whitespace in API key', () => {
      const store = useAIConfigStore.getState();
      store.setApiKey('  sk-test-key  ');

      expect(useAIConfigStore.getState().apiKey).toBe('  sk-test-key  ');
    });

    it('should handle special characters in API key', () => {
      const store = useAIConfigStore.getState();
      const specialKey = 'sk-!@#$%^&*()_+-={}[]|:;<>?,./';
      store.setApiKey(specialKey);

      expect(useAIConfigStore.getState().apiKey).toBe(specialKey);
    });

    it('should handle fractional temperature values', () => {
      const store = useAIConfigStore.getState();
      store.setTemperature(0.123456789);

      expect(useAIConfigStore.getState().temperature).toBeCloseTo(0.123456789);
    });

    it('should handle zero max tokens (clamped to 1)', () => {
      const store = useAIConfigStore.getState();
      store.setMaxTokens(0);

      expect(useAIConfigStore.getState().maxTokens).toBe(1);
    });
  });
});
