export const getProviderName = (providerKey: string): string => {
  if (providerKey === "local") return "local";
  if (providerKey === "ba05352a-c91e-4d41-989e-64a00ffed899") return "google";
  if (providerKey === "f0cb757a-a096-4979-8dba-3638ed23bcd3") return "google";
  return providerKey;
};
