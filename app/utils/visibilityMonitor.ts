import { toast } from 'react-toastify';

let hasShownBackgroundWarning = false;
let visibilityWarningToastId: string | number | undefined;

export function setupVisibilityMonitor() {
  if (typeof document === 'undefined') {
    return;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (!hasShownBackgroundWarning) {
        visibilityWarningToastId = toast.warning(
          'Tab is in background. Keep this tab active during app generation to prevent commands from getting stuck.',
          {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
          }
        );
        hasShownBackgroundWarning = true;
      }
    } else {
      if (visibilityWarningToastId) {
        toast.dismiss(visibilityWarningToastId);
        visibilityWarningToastId = undefined;
      }
      hasShownBackgroundWarning = false;
    }
  });
}

export function isTabVisible(): boolean {
  return typeof document !== 'undefined' ? !document.hidden : true;
}
