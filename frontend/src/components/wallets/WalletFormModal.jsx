import { Loader2 } from "lucide-react";
import { useState } from "react";
import WalletService from "../../../services/WalletService";
import { getErrorMessage } from "../../utils/errors";
import { validateName } from "../../utils/validators";
import Input from "../Input";
import Modal from "../Modal";
import { useToast } from "../useToast";

// Creates a wallet, or edits it when a `wallet` is passed in.
export default function WalletFormModal({ wallet, onClose, onSaved }) {
  const isEdit = Boolean(wallet);
  const { addToast } = useToast();
  const [name, setName] = useState(wallet?.name ?? "");
  const [description, setDescription] = useState(wallet?.description ?? "");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateName(name);
    setNameError(error);
    if (error) return;

    setSaving(true);
    try {
      const service = new WalletService();
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
      };
      const saved = isEdit
        ? await service.update(wallet.id, payload)
        : await service.create(payload);

      addToast({
        type: "success",
        title: isEdit ? "Wallet updated" : "Wallet created",
      });
      onSaved(saved);
    } catch (err) {
      addToast({
        type: "error",
        title: "Could not save the wallet",
        description: getErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit wallet" : "New wallet"} onClose={onClose}>
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          id="wallet-name"
          placeholder="e.g. Household"
          autoFocus
          value={name}
          error={nameError}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError(validateName(e.target.value));
          }}
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="wallet-description"
            className="text-sm font-semibold text-[#0c0c0c]"
          >
            Description <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            id="wallet-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#cb9d6c]"
          />
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#a88d6f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#91755a] disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create wallet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
