import { Camera, KeyRound, Loader2, Trash2, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import UserService from "../../../services/UserService";
import Avatar from "../../components/Avatar";
import Input from "../../components/Input";
import PasswordStrength from "../../components/PasswordStrength";
import { useToast } from "../../components/useToast";
import { getErrorMessage } from "../../utils/errors";
import {
  AVATAR_ACCEPTED_TYPES,
  AVATAR_MAX_FILE_SIZE,
  resizeImageToDataUrl,
} from "../../utils/image";
import {
  validateNewPassword,
  validatePasswordConfirmation,
} from "../../utils/password";
import { validateRequired } from "../../utils/validators";

const primaryButtonClass =
  "flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#a88d6f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#91755a] disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass =
  "flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60";

const validateName = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return "Name is required";
  if (trimmed.length < 2 || trimmed.length > 100)
    return "Name must be between 2 and 100 characters";
  return "";
};

const Section = ({ id, icon, title, description, children }) => {
  const Icon = icon;
  return (
    <section
      id={id}
      className="scroll-mt-6 rounded-xl border border-gray-200 bg-white"
    >
      <div className="flex items-start gap-3 border-b border-gray-100 px-6 py-4">
        <div className="rounded-lg bg-[#a88d6f]/10 p-2 text-[#a88d6f]">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
};

const ProfileInfoForm = ({ user, onUserChange }) => {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [name, setName] = useState(user?.name ?? "");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  const nameChanged = user && name.trim() !== user.name;

  const handleSaveName = async (e) => {
    e.preventDefault();
    const error = validateName(name);
    setNameError(error);
    if (error || !nameChanged) return;

    setSaving(true);
    try {
      const updated = await new UserService().updateProfile(name.trim());
      onUserChange(updated);
      addToast({ type: "success", title: "Profile updated" });
    } catch (err) {
      addToast({
        type: "error",
        title: "Could not update your profile",
        description: getErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allows picking the same file again
    if (!file) return;

    if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
      addToast({
        type: "error",
        title: "Unsupported file",
        description: "Choose a PNG, JPEG or WebP image.",
      });
      return;
    }
    if (file.size > AVATAR_MAX_FILE_SIZE) {
      addToast({
        type: "error",
        title: "Image too large",
        description: "Choose an image up to 5 MB.",
      });
      return;
    }

    setAvatarBusy(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      const updated = await new UserService().updateAvatar(dataUrl);
      onUserChange(updated);
      addToast({ type: "success", title: "Profile picture updated" });
    } catch (err) {
      addToast({
        type: "error",
        title: "Could not update your picture",
        description: getErrorMessage(err),
      });
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarBusy(true);
    try {
      const updated = await new UserService().removeAvatar();
      onUserChange(updated);
      addToast({ type: "success", title: "Profile picture removed" });
    } catch (err) {
      addToast({
        type: "error",
        title: "Could not remove your picture",
        description: getErrorMessage(err),
      });
    } finally {
      setAvatarBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative">
          <Avatar user={user} size="lg" />
          {avatarBusy && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-[#a88d6f]" />
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarBusy || !user}
              className={secondaryButtonClass}
            >
              <Camera size={16} />
              {user?.avatar ? "Change picture" : "Upload picture"}
            </button>
            {user?.avatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={avatarBusy}
                className={`${secondaryButtonClass} hover:border-red-200 hover:text-red-600`}
              >
                <Trash2 size={16} />
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400">PNG, JPEG or WebP, up to 5 MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={AVATAR_ACCEPTED_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
            aria-label="Profile picture"
          />
        </div>
      </div>

      <form
        noValidate
        onSubmit={handleSaveName}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Name"
            id="profile-name"
            required
            value={name}
            error={nameError}
            disabled={!user}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(validateName(e.target.value));
            }}
            onBlur={(e) => setNameError(validateName(e.target.value))}
          />
          <div className="flex flex-col gap-1">
            <Input
              label="Email"
              id="profile-email"
              type="email"
              value={user?.email ?? ""}
              disabled
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2 px-4 text-gray-500"
            />
            <p className="text-xs text-gray-400">
              Your email is used to sign in and can't be changed
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !nameChanged}
            className={primaryButtonClass}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
};

const PasswordForm = () => {
  const { addToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const setError = (field, message) =>
    setErrors((prev) => ({ ...prev, [field]: message }));

  // The new password must be valid and different from the current one.
  const checkNewPassword = (value, current = currentPassword) => {
    const error = validateNewPassword(value);
    if (error) return error;
    return value === current
      ? "The new password must be different from the current one"
      : "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {
      currentPassword: validateRequired(currentPassword),
      newPassword: checkNewPassword(newPassword),
      confirmPassword: validatePasswordConfirmation(
        newPassword,
        confirmPassword,
      ),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsLoading(true);
    try {
      await new UserService().changePassword(currentPassword, newPassword);
      addToast({
        type: "success",
        title: "Password changed!",
        description: "Your password has been successfully updated",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (err) {
      const message = getErrorMessage(
        err,
        "We couldn't update your password at this time.",
      );
      // A wrong current password is reported on that field.
      if (/current password/i.test(message)) {
        setError("currentPassword", message);
      } else {
        addToast({
          type: "error",
          title: "Update failed",
          description: message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="md:w-1/2 md:pr-2">
        <Input
          label="Current Password"
          id="current-password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          value={currentPassword}
          error={errors.currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (errors.currentPassword) {
              setError("currentPassword", validateRequired(e.target.value));
            }
          }}
          onBlur={(e) =>
            setError("currentPassword", validateRequired(e.target.value))
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Input
            label="New Password"
            id="new-password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            value={newPassword}
            error={errors.newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) {
                setError("newPassword", checkNewPassword(e.target.value));
              }
              if (errors.confirmPassword) {
                setError(
                  "confirmPassword",
                  validatePasswordConfirmation(e.target.value, confirmPassword),
                );
              }
            }}
            onBlur={(e) =>
              setError("newPassword", checkNewPassword(e.target.value))
            }
          />
          <PasswordStrength password={newPassword} />
        </div>

        <Input
          label="Confirm New Password"
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          value={confirmPassword}
          error={errors.confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) {
              setError(
                "confirmPassword",
                validatePasswordConfirmation(newPassword, e.target.value),
              );
            }
          }}
          onBlur={(e) =>
            setError(
              "confirmPassword",
              validatePasswordConfirmation(newPassword, e.target.value),
            )
          }
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={primaryButtonClass}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Updating..." : "Update password"}
        </button>
      </div>
    </form>
  );
};

const Profile = () => {
  const { user, setUser } = useOutletContext();
  const location = useLocation();

  // /app/profile/password opens the page at the password section.
  useEffect(() => {
    if (location.pathname.endsWith("/password")) {
      document
        .getElementById("password")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.pathname]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profile settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your personal information and password
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Section
          id="profile"
          icon={UserRound}
          title="Personal information"
          description="Your name and profile picture appear across FinEXP"
        >
          <ProfileInfoForm user={user} onUserChange={setUser} />
        </Section>

        <Section
          id="password"
          icon={KeyRound}
          title="Password"
          description="Enter your current password and choose a new one"
        >
          <PasswordForm />
        </Section>
      </div>
    </div>
  );
};

export default Profile;
