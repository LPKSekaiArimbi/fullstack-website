"use client";

import { useLayoutEffect } from "react";
import {
  hasUnsavedRegistrationFormChanges,
  showRegistrationNavigationWarningDialog,
} from "@/lib/registration-navigation";

export function NavigationGuard() {
  useLayoutEffect(() => {
    let skipNextPopstate = false;
    const guardHistoryNavigation = (event: PopStateEvent) => {
      if (skipNextPopstate) {
        skipNextPopstate = false;
        return;
      }
      if (!hasUnsavedRegistrationFormChanges()) return;

      event.stopImmediatePropagation();
      skipNextPopstate = true;
      showRegistrationNavigationWarningDialog();
      window.setTimeout(() => window.history.forward(), 0);
    };

    window.addEventListener("popstate", guardHistoryNavigation, true);
    return () => {
      window.removeEventListener("popstate", guardHistoryNavigation, true);
    };
  }, []);

  return null;
}
