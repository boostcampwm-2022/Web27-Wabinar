import FormModal, { ModalContents } from './FormModal';

interface CreateSuccessModalProps {
  modalContents: ModalContents;
  onClose: () => void;
}

function CreateSuccessModal({
  modalContents,
  onClose,
}: CreateSuccessModalProps) {
  const onSubmit = () => {
    return;
  };

  return (
    <FormModal
      {...modalContents}
      onClose={onClose}
      onSubmit={onSubmit}
      isDisabled
      inputValue="WAB1234"
    />
  );
}

export default CreateSuccessModal;