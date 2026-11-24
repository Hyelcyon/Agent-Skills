# Native Dialog, Popover API, and Anchor Positioning

Engineering standards for building top-layer UI components using native browser primitives without heavy external JavaScript libraries.

---

## 1. Native `<dialog>` Element Standards

HTML `<dialog>` provides accessible modal dialogs with native focus trapping and backdrop dimming.

### Declaration and Method Invocations
```html
<dialog id="confirmation-dialog" class="accessible-dialog" aria-labelledby="dialog-title">
  <form method="dialog">
    <h2 id="dialog-title">Confirm Action</h2>
    <p>Are you sure you want to proceed with this operation?</p>
    <menu>
      <button value="cancel">Cancel</button>
      <button value="confirm" autofocus>Confirm</button>
    </menu>
  </form>
</dialog>
```

### Script Execution Standard
Always open modal dialogs using `.showModal()`, never `.show()`:
```typescript
export function openModalDialog(dialog: HTMLDialogElement): Promise<string> {
  return new Promise((resolve) => {
    dialog.showModal();
    dialog.addEventListener(
      'close',
      () => {
        resolve(dialog.returnValue);
      },
      { once: true }
    );
  });
}
```

### Why `.showModal()` is Mandatory
- Promotes element to the browser's top layer (above all `z-index` contexts).
- Automatically marks the rest of the document as inert, disabling background keyboard and pointer interaction.
- Enables native `::backdrop` styling and handles the `Escape` key automatically.

---

## 2. HTML Popover API

The Popover API provides top-layer popups, tooltips, menus, and comboboxes with zero JavaScript requirement for toggle and light dismiss:

```html
<button popovertarget="user-action-menu">Open Menu</button>

<div id="user-action-menu" popover="auto" class="menu-popup">
  <ul>
    <li><a href="/profile">Profile Settings</a></li>
    <li><a href="/billing">Billing</a></li>
    <li><button type="button">Sign Out</button></li>
  </ul>
</div>
```

### Characteristics of `popover="auto"`
- Native "Light Dismiss": Clicking anywhere outside the popover or pressing `Escape` closes it automatically.
- Top-layer rendering: Guarantees the popover will not be clipped by parent containers with `overflow: hidden`.
- No focus trap: Unlike `<dialog>`, non-modal popovers permit interacting with background elements while remaining visible.

---

## 3. CSS Anchor Positioning

Anchor Positioning ties top-layer popovers or tooltips directly to anchor elements in CSS without JavaScript coordinate calculations:

```css
.anchor-trigger {
  anchor-name: --menu-trigger;
}

.menu-popup {
  position: fixed;
  position-anchor: --menu-trigger;
  top: anchor(bottom);
  left: anchor(left);
  margin-top: 8px;
}
```
