let hasUnsavedRegistrationChanges = false;
let showRegistrationNavigationWarning: (() => void) | null = null;

export function setRegistrationChangesUnsaved(isUnsaved: boolean) {
  hasUnsavedRegistrationChanges = isUnsaved;
}

export function hasUnsavedRegistrationFormChanges() {
  return hasUnsavedRegistrationChanges;
}

export function setRegistrationNavigationWarningHandler(
  handler: (() => void) | null,
) {
  showRegistrationNavigationWarning = handler;
}

export function showRegistrationNavigationWarningDialog() {
  showRegistrationNavigationWarning?.();
}
