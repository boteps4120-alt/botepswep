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
        closeDropdown(dropdown);
      }
    }

    function handleMouseLeave(event: MouseEvent) {
      const target = event.currentTarget as Element | null;
      target?.classList.remove("nav-dropdown-closed");
    }

    const dropdowns = Array.from(document.querySelectorAll(".nav-dropdown"));
    const header = document.querySelector(".site-header");

    document.addEventListener("click", handleClick);
    dropdowns.forEach((dropdown) => dropdown.addEventListener("mouseleave", handleMouseLeave as EventListener));
    header?.addEventListener("mouseleave", clearDropdownLocks);

    return () => {
      document.removeEventListener("click", handleClick);
      dropdowns.forEach((dropdown) => dropdown.removeEventListener("mouseleave", handleMouseLeave as EventListener));
      header?.removeEventListener("mouseleave", clearDropdownLocks);
    };
  }, []);

  return null;
}
