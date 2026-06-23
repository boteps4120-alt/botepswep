"use client";

import { useEffect } from "react";

export function NavDropdownBehavior() {
  useEffect(() => {
    function clearDropdownLocks() {
      document.body.classList.remove("nav-dropdowns-suppressed");
      document.querySelectorAll(".nav-dropdown.nav-dropdown-closed").forEach((item) => {
        item.classList.remove("nav-dropdown-closed");
      });
    }

    function closeDropdown(dropdown: Element | null) {
      document.querySelectorAll(".nav-dropdown.nav-dropdown-closed").forEach((item) => {
        if (item !== dropdown) item.classList.remove("nav-dropdown-closed");
      });

      document.body.classList.add("nav-dropdowns-suppressed");
      dropdown?.classList.add("nav-dropdown-closed");
    }

    function handleClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const dropdownLink = target?.closest(".nav-dropdown a");
      const dropdown = target?.closest(".nav-dropdown");

      if (dropdownLink && dropdown) {
        if (dropdownLink instanceof HTMLElement) {
          dropdownLink.blur();
        }

        closeDropdown(dropdown);
      }
    }

    function handleMouseLeave(event: MouseEvent) {
      const target = event.currentTarget as Element | null;
      target?.classList.remove("nav-dropdown-closed");
    }

    function handlePointerMove(event: PointerEvent) {
      if (!document.body.classList.contains("nav-dropdowns-suppressed")) return;

      const pointerIsInsideDropdownSurface = Array.from(
        document.querySelectorAll(".nav-dropdown-trigger, .nav-dropdown-panel")
      ).some((element) => {
        const rect = element.getBoundingClientRect();
        return (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        );
      });

      if (!pointerIsInsideDropdownSurface) {
        clearDropdownLocks();
      }
    }

    const dropdowns = Array.from(document.querySelectorAll(".nav-dropdown"));

    document.addEventListener("click", handleClick);
    document.addEventListener("pointermove", handlePointerMove);
    dropdowns.forEach((dropdown) => dropdown.addEventListener("mouseleave", handleMouseLeave as EventListener));

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("pointermove", handlePointerMove);
      dropdowns.forEach((dropdown) => dropdown.removeEventListener("mouseleave", handleMouseLeave as EventListener));
    };
  }, []);

  return null;
}
