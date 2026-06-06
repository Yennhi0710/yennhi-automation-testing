export const users = {
  standard: { username: "standard_user", password: "secret_sauce" },
  lockedOut: { username: "locked_out_user", password: "secret_sauce" },
  invalid: { username: "standard_user", password: "wrong_password" },
  performance: { username: "performance_glitch_user", password: "secret_sauce" },
} as const;

export const products = {
  backpack: { name: "Sauce Labs Backpack", slug: "sauce-labs-backpack" },
  bikeLight: { name: "Sauce Labs Bike Light", slug: "sauce-labs-bike-light" },
} as const;
