export function getBranding() {
  return {
    title: process.env.APP_TITLE || "Any Agent",
    logoUrl: process.env.APP_LOGO_URL || "",
  };
}
