import { createContext, useContext, useState } from "react";

const ModalContext = createContext(null);

export function useModal() {
  return useContext(ModalContext);
}

function ModalOverlay({ component }: { component: React.ReactNode }) {
  if (!component) {
    return null;
  }
  return (
    <div className="z-10 fixed flex justify-center items-center bg-black/50 w-full h-full">
      <div className="w-[375px] bg-background big-neo-box p-4">{component}</div>
    </div>
  );
}

export function ModalProvider({ children }) {
  const [component, setComponent] = useState<React.ReactNode>(null);

  function setModal(reactNode: React.ReactNode) {
    setComponent(reactNode);
  }

  function closeModal() {
    setComponent(null);
  }

  return (
    <ModalContext.Provider value={{ setModal, closeModal }}>
      <ModalOverlay component={component} />
      {children}
    </ModalContext.Provider>
  );
}
