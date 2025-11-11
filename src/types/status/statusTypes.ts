export interface StatusOptions {
  instance?: string;
  verbose?: boolean;
}

export interface InstanceStatus {
  instanceName: string;
  siteTitle: string;
  theme: string;
  logoUrl: string;
  totalPages: number;
  publishedPages: number;
  totalUsers: number;
  adminUsers: number;
  version: string;
  locales: string[];
}

export interface HealthStatus {
  isHealthy: boolean;
  responseTime: number;
  statusMessage: string;
  version: string;
  uptime?: string;
}

export interface StatusResult {
  instance: InstanceStatus;
  health: HealthStatus;
}

export interface AllInstancesStatusResult {
  instances: StatusResult[];
}
