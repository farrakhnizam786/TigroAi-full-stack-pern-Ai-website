export const callWithRetry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (error.response?.status === 429 && retries > 0) {
      // wait before retry (prevents 429 spam)
      await new Promise((res) => setTimeout(res, delay));
      return callWithRetry(fn, retries - 1, delay * 2); // exponential backoff
    }
    throw error;
  }
};