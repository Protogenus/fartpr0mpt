// Basic script to load balance from local storage
document.addEventListener('DOMContentLoaded', () => {
  const balance = localStorage.getItem('fartBalance') || '0';
  const el = document.getElementById('fart-balance');
  if (el) {
    el.textContent = `ƒ ${parseFloat(balance).toFixed(6)}`;
  }
});
