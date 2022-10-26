import { useState } from "react";

export const useMapModal = () => {
  const [isOpen, setIsOpen] = useState(true);

  const openModal = ()=> setIsOpen(true);
  const closeModal = ()=> setIsOpen(false);

  return { openModal, closeModal, isOpen };
};
