export const isAuthorizedWebhookRequest = (
  authorizationHeader: string | null,
  expectedSecret: string | undefined,
): boolean => {
  if (!expectedSecret) return false;
  if (!authorizationHeader) return false;

  return authorizationHeader === `Bearer ${expectedSecret}`;
};
