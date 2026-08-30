export function getBranding() {
  return {
    title: process.env.APP_TITLE || "Any Agent",
    logoUrl: process.env.APP_LOGO_URL || "",
    primaryColor: process.env.APP_PRIMARY_COLOR || "#6963ff",
  };
}
