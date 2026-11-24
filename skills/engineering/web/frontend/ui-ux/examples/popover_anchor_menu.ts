export function initializePopoverMenu(
  buttonTrigger: HTMLElement,
  menuPopover: HTMLElement
): { open: () => void; close: () => void; isSupported: boolean } {
  const isSupported = typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype;

  if (isSupported) {
    menuPopover.setAttribute('popover', 'auto');
    buttonTrigger.setAttribute('popovertarget', menuPopover.id);
  }

  return {
    open: () => {
      if (isSupported && menuPopover.matches(':popover-open') === false) {
        (menuPopover as HTMLElement & { showPopover: () => void }).showPopover();
      }
    },
    close: () => {
      if (isSupported && menuPopover.matches(':popover-open')) {
        (menuPopover as HTMLElement & { hidePopover: () => void }).hidePopover();
      }
    },
    isSupported
  };
}
