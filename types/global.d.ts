interface GrecaptchaInstance {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

interface Window {
  grecaptcha: GrecaptchaInstance;
}
