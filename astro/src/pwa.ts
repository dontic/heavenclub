import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Optionally, prompt user to refresh. For now, reload immediately.
    updateSW(true);
  },
  onOfflineReady() {
    // eslint-disable-next-line no-console
    console.log('App ready to work offline');
  },
});
