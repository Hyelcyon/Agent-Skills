interface ModalController {
  open: () => void;
  close: () => void;
  destroy: () => void;
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function createAccessibleModal(dialogElement: HTMLElement, triggerElement?: HTMLElement): ModalController {
  let previouslyFocusedElement: HTMLElement | null = null;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = Array.from(dialogElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  const open = () => {
    previouslyFocusedElement = (triggerElement ?? document.activeElement) as HTMLElement | null;
    dialogElement.setAttribute('aria-modal', 'true');
    dialogElement.setAttribute('role', 'dialog');
    dialogElement.removeAttribute('hidden');

    dialogElement.addEventListener('keydown', handleKeyDown);

    const focusable = dialogElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      dialogElement.focus();
    }
  };

  const close = () => {
    dialogElement.removeEventListener('keydown', handleKeyDown);
    dialogElement.setAttribute('hidden', '');

    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
      previouslyFocusedElement.focus();
    }
  };

  const destroy = () => {
    close();
  };

  return { open, close, destroy };
}

export { createAccessibleModal, FOCUSABLE_SELECTOR };
export type { ModalController };
