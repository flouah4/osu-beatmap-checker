import { useModal } from "../../context/modal_context";

export function CloseModalButton({ children, ...rest }) {
  const { closeModal } = useModal();

  return (
    <div onClick={closeModal} {...rest}>
      {children}
    </div>
  );
}
