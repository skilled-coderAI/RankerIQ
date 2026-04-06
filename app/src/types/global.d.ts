interface GoogleIdTokenResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleIdTokenResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: string;
  }) => void;
  prompt: (callback?: (notification: unknown) => void) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      type?: "standard" | "icon";
      shape?: "rectangular" | "pill" | "circle" | "square";
      text?: string;
      width?: number;
      logo_alignment?: "left" | "center";
    }
  ) => void;
  disableAutoSelect: () => void;
  revoke: (hint: string, callback: () => void) => void;
}

interface PuterUser {
  username: string;
  email?: string;
  uuid: string;
}

interface PuterKV {
  set: (key: string, value: string) => Promise<void>;
  get: (key: string) => Promise<string | null>;
}

interface PuterAuth {
  signIn: () => Promise<PuterUser>;
  signOut: () => Promise<void>;
  isSignedIn: () => boolean;
  getUser: () => Promise<PuterUser>;
}

interface Puter {
  auth: PuterAuth;
  kv: PuterKV;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
    puter?: Puter;
  }
}

export {};
