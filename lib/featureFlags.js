const parseBoolean = (value, fallback = false) => {
  if (typeof value === "undefined") return fallback;
  return String(value).toLowerCase() === "true";
};

export function getFeatureFlags() {
  return {
    birthdayRemindersEnabled: parseBoolean(process.env.FEATURE_BIRTHDAY_REMINDERS, true),
    emergencyAutoReplacementEnabled: parseBoolean(process.env.FEATURE_EMERGENCY_AUTO_REPLACEMENT, true),
    strictInventoryGateEnabled: parseBoolean(process.env.FEATURE_STRICT_INVENTORY_GATE, true)
  };
}

export function isFeatureEnabled(flagName) {
  const flags = getFeatureFlags();
  return Boolean(flags[flagName]);
}
