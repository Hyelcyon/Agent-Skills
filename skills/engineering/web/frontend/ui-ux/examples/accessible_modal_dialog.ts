interface ModalController {
  open: () => void;
  close: () => void;
  destroy: () => void;
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function createAccessibleModal(dialogElement: HTMLElement, triggerElement?: HTMLElement): ModalController {
  let previouslyFocusedElement: HTMLElement | null = null;
  let isOpen = false;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = Array.from(dialogElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      if (!firstElement || !lastElement) {
        event.preventDefault();
        return;
      }

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
    if (isOpen) return;
    isOpen = true;
    previouslyFocusedElement = (triggerElement ?? document.activeElement) as HTMLElement | null;
    dialogElement.setAttribute('aria-modal', 'true');
    dialogElement.setAttribute('role', 'dialog');
    dialogElement.removeAttribute('hidden');

    dialogElement.addEventListener('keydown', handleKeyDown);

    const firstFocusable = dialogElement.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      dialogElement.focus();
    }
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    dialogElement.removeEventListener('keydown', handleKeyDown);
    dialogElement.setAttribute('hidden', '');

    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
      previouslyFocusedElement.focus();
    }
  };

  const destroy = () => {
    close();
    dialogElement.removeEventListener('keydown', handleKeyDown);
  };

  return { open, close, destroy };
}

export { createAccessibleModal, FOCUSABLE_SELECTOR };
export type { ModalController };
