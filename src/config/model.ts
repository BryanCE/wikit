import type { GitConfigStored } from "@/types/config/configTypes";

export interface WikiInstance {
  id: string;
  name: string;
  url: string;
  key: string;
}

export interface EncryptedConfig {
  version: string;
  instances: {
    id: string;
    name: string;
    url: string;
    encryptedKey: string;
    iv: string;
  }[];
  salt: string;
  preferences?: {
    defaultTheme?: string;
  };
  git?: GitConfigStored;
}
