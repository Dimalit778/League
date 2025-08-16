export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
  login: () => [...authKeys.all, "login"] as const,
  register: () => [...authKeys.all, "register"] as const,
  logout: () => [...authKeys.all, "logout"] as const,
};
