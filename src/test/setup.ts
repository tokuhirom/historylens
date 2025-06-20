import { vi } from 'vitest';

// Extend global type to include chrome
declare global {
  var chrome: {
    storage: {
      sync: {
        get: ReturnType<typeof vi.fn>;
        set: ReturnType<typeof vi.fn>;
      };
    };
    runtime: {
      sendMessage: ReturnType<typeof vi.fn>;
    };
  };
}

// Mock Chrome API for tests
global.chrome = {
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn()
    }
  },
  runtime: {
    sendMessage: vi.fn()
  }
};
