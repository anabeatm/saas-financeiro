import { Loader2 } from "lucide-react";
import { useState } from "react";
import CategoryService from "../../../services/CategoryService";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_COLOR,
  getCategoryIcon,
} from "../../utils/categoryIcons";
import { getErrorMessage } from "../../utils/errors";
import { validateCategoryName } from "../../utils/validators";
import Input from "../Input";
import Modal from "../Modal";
import { useToast } from "../useToast";

const TYPES = [
  { value: "EXPENSE", label: "Expense", active: "bg-red-600 text-white" },
  { value: "INCOME", label: "Income", active: "bg-green-600 text-white" },
];

// Creates a category, or edits `category` when it is passed in.
export default function CategoryFormModal({
  category,
  defaultType = "EXPENSE",
  onClose,
  onSaved,
}) {
  const isEdit = Boolean(category);
  const { addToast } = useToast();

  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState(category?.type ?? defaultType);
  const [color, setColor] = useState(category?.color ?? DEFAULT_CATEGORY_COLOR);
  const [icon, setIcon] = useState(category?.icon ?? "");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateCategoryName(name);
    setNameError(error);
    if (error) return;

    setSaving(true);
    try {
      const service = new CategoryService();
      const payload = { name: name.trim(), type, color, icon: icon || null };
      const saved = isEdit
        ? await service.update(category.id, payload)
        : await service.create(payload);

      addToast({
        type: "success",
        title: isEdit ? "Category updated" : "Category created",
      });
      onSaved(saved);
    } catch (err) {
      addToast({
        type: "error",
        title: "Could not save the category",
        description: getErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit category" : "New category"} onClose={onClose}>
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          id="category-name"
          placeholder="e.g. Groceries"
          autoFocus
          value={name}
          error={nameError}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError(validateCategoryName(e.target.value));
          }}
        />

        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[#0c0c0c]">Type</span>
          <div
            role="group"
            aria-label="Category type"
            className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1"
          >
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                disabled={isEdit}
                aria-pressed={type === t.value}
                onClick={() => setType(t.value)}
                className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                  type === t.value
                    ? t.active
                    : "text-gray-500 enabled:hover:bg-gray-200"
                } ${isEdit ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {isEdit && (
            <p className="text-xs text-gray-400">
              The type can&apos;t be changed after the category is created.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#0c0c0c]">Color</span>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                aria-pressed={color.toLowerCase() === c.toLowerCase()}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`h-7 w-7 cursor-pointer rounded-full ring-offset-2 ${
                  color.toLowerCase() === c.toLowerCase()
                    ? "ring-2 ring-gray-700"
                    : ""
                }`}
              />
            ))}
            <input
              type="color"
              aria-label="Custom color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-7 w-9 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#0c0c0c]">
            Icon <span className="font-normal text-gray-400">(optional)</span>
          </span>
          <div className="grid grid-cols-7 gap-2">
            {Object.keys(CATEGORY_ICONS).map((key) => {
              const Icon = getCategoryIcon(key);
              return (
                <button
                  key={key}
                  type="button"
                  title={key}
                  aria-label={`Icon ${key}`}
                  aria-pressed={icon === key}
                  onClick={() => setIcon(icon === key ? "" : key)}
                  className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border ${
                    icon === key
                      ? "border-transparent text-white"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                  style={icon === key ? { backgroundColor: color } : undefined}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
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
            {isEdit ? "Save changes" : "Create category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
