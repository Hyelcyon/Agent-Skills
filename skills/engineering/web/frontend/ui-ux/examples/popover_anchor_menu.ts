export function initializePopoverMenu(
  buttonTrigger: HTMLElement,
  menuPopover: HTMLElement
): { open: () => void; close: () => void; isSupported: boolean } {
  const isSupported = typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype;

  if (isSupported) {
    if (!menuPopover.id) {
      throw new Error('menuPopover must define a non-empty id attribute for popovertarget binding');
    }
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
