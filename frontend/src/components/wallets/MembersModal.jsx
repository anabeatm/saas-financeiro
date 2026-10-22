import { Loader2, Trash2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import WalletMemberService from "../../../services/WalletMemberService";
import { getErrorMessage } from "../../utils/errors";
import { getInitials } from "../../utils/format";
import { validateEmail } from "../../utils/validators";
import ConfirmDialog from "../ConfirmDialog";
import Input from "../Input";
import Modal from "../Modal";
import { useToast } from "../useToast";

const ROLE_LABELS = {
  OWNER: "Owner",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

const ROLE_HINTS = {
  EDITOR: "can add, edit and delete transactions",
  VIEWER: "can only view",
};

// Lists the members of a wallet. The owner can also invite, change roles and remove members.
export default function MembersModal({ wallet, isOwner, onClose }) {
  const { addToast } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [adding, setAdding] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      setMembers(await new WalletMemberService().list(wallet.id));
    } catch (err) {
      addToast({
        type: "error",
        title: "Could not load the members",
        description: getErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }, [wallet.id, addToast]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleAdd = async (e) => {
    e.preventDefault();

    const error = validateEmail(email);
    setEmailError(error);
    if (error) return;

    setAdding(true);
    try {
      await new WalletMemberService().add(wallet.id, {
        email: email.trim(),
        role,
      });
      addToast({ type: "success", title: "Member added" });
      setEmail("");
      await loadMembers();
    } catch (err) {
      addToast({
        type: "error",
        title: "Could not add the member",
        description: getErrorMessage(err),
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (member, newRole) => {
    try {
      await new WalletMemberService().updateRole(
        wallet.id,
        member.userId,
        newRole,
      );
      addToast({ type: "success", title: "Role updated" });
      await loadMembers();
    } catch (err) {
      addToast({
        type: "error",
        title: "Could not change the role",
        description: getErrorMessage(err),
      });
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await new WalletMemberService().remove(wallet.id, memberToRemove.userId);
      addToast({ type: "success", title: "Member removed" });
      setMemberToRemove(null);
      await loadMembers();
    } catch (err) {
      addToast({
        type: "error",
        title: "Could not remove the member",
        description: getErrorMessage(err),
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <Modal
        title={`Members of "${wallet.name}"`}
        onClose={onClose}
        size="lg"
        closeOnEscape={!memberToRemove}
      >
        {isOwner && (
          <form
            noValidate
            onSubmit={handleAdd}
            className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
          >
            <p className="text-sm font-semibold text-gray-700">
              Invite someone by e-mail
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <Input
                id="member-email"
                type="email"
                placeholder="person@email.com"
                value={email}
                error={emailError}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(validateEmail(e.target.value));
                }}
              />
              <select
                aria-label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="VIEWER">Viewer</option>
                <option value="EDITOR">Editor</option>
              </select>
              <button
                type="submit"
                disabled={adding}
                className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#a88d6f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#91755a] disabled:opacity-60"
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus size={16} />
                )}
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Editor: {ROLE_HINTS.EDITOR}. Viewer: {ROLE_HINTS.VIEWER}. The
              person must already have a FinEXP account.
            </p>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#a88d6f]" />
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-100">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#a88d6f] text-sm font-semibold text-white">
                    {getInitials(member.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-700">
                      {member.name}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {isOwner && member.role !== "OWNER" ? (
                    <>
                      <select
                        aria-label={`Role of ${member.name}`}
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member, e.target.value)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs"
                      >
                        <option value="VIEWER">Viewer</option>
                        <option value="EDITOR">Editor</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setMemberToRemove(member)}
                        aria-label={`Remove ${member.name}`}
                        title="Remove member"
                        className="cursor-pointer p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {ROLE_LABELS[member.role] ?? member.role}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {memberToRemove && (
        <ConfirmDialog
          title="Remove member"
          message={`${memberToRemove.name} will lose access to "${wallet.name}".`}
          confirmLabel="Remove"
          busy={removing}
          onConfirm={handleRemove}
          onCancel={() => setMemberToRemove(null)}
        />
      )}
    </>
  );
}
