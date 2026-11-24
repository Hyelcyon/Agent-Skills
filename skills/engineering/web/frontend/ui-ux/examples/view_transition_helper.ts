type ViewTransitionCallback = () => Promise<void> | void;

interface ViewTransitionHandle {
  finished: Promise<void>;
  ready?: Promise<void>;
  updateCallbackDone?: Promise<void>;
  skipTransition?: () => void;
}

interface ViewTransitionDocument {
  startViewTransition?: (callback: ViewTransitionCallback) => ViewTransitionHandle;
}

async function executeViewTransition(domUpdate: ViewTransitionCallback): Promise<void> {
  const doc = document as unknown as ViewTransitionDocument;

  if (typeof doc.startViewTransition === 'function') {
    const transition = doc.startViewTransition(async () => {
      await domUpdate();
    });
    await transition.finished;
    return;
  }

  await domUpdate();
}

export { executeViewTransition };
export type { ViewTransitionCallback, ViewTransitionHandle, ViewTransitionDocument };
