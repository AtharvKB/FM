export const handleApiError = (error, showToast) => {
  console.error('API Error:', error);

  // Network error
  if (!navigator.onLine) {
    showToast('No internet connection. Please check your network.', 'error');
    return { message: 'No internet connection' };
  }

  // Timeout error
  if (error.name === 'AbortError') {
    showToast('Request timeout. Please try again.', 'error');
    return { message: 'Request timeout' };
  }

  // Server not responding
  if (error.message === 'Failed to fetch') {
    showToast('Cannot connect to server. Please try again later.', 'error');
    return { message: 'Server not responding' };
  }

  // Generic error
  showToast('Something went wrong. Please try again.', 'error');
  return { message: 'Unknown error' };
};

export const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

export const retryFetch = async (url, options = {}, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithTimeout(url, options);
      if (response.ok) return response;
      
      // If not ok and not last retry, wait and retry
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
