import { Inbox, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CategoryService from "../../../services/CategoryService";
import CategoryFormModal from "../../components/categories/CategoryFormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../components/useToast";
import {
  DEFAULT_CATEGORY_COLOR,
  getCategoryIcon,
} from "../../utils/categoryIcons";
import { getErrorMessage } from "../../utils/errors";

const SECTIONS = [
  { type: "EXPENSE", title: "Expense categories" },
  { type: "INCOME", title: "Income categories" },
];

const Categories = () => {
  const { addToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // null = closed; { type } = new category of that type; category = edit
  const [form, setForm] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await new CategoryService().list());
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your categories."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSaved = async () => {
    setForm(null);
    await loadCategories();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await new CategoryService().remove(categoryToDelete.id);
      addToast({ type: "success", title: "Category deleted" });
      setCategoryToDelete(null);
      await loadCategories();
    } catch (err) {
      // e.g. 422 when the category still has transactions
      addToast({
        type: "error",
        title: "Could not delete the category",
        description: getErrorMessage(err),
      });
      setCategoryToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#a88d6f] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Group your transactions. Categories are private to your account.
          </p>
        </div>
        <button
          onClick={() => setForm({ type: "EXPENSE" })}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#a88d6f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#91755a]"
        >
          <Plus size={18} />
          New category
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-8">
        {SECTIONS.map((section) => {
          const items = categories.filter((c) => c.type === section.type);
          return (
            <section key={section.type}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                  {section.title}
                </h2>
                <button
                  onClick={() => setForm({ type: section.type })}
                  className="cursor-pointer text-xs font-semibold text-[#a88d6f] hover:underline"
                >
                  + Add
                </button>
              </div>

              {items.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-gray-400">
                  <Inbox size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">No categories of this type yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((category) => {
                    const Icon = getCategoryIcon(category.icon);
                    return (
                      <div
                        key={category.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                            style={{
                              backgroundColor:
                                category.color || DEFAULT_CATEGORY_COLOR,
                            }}
                          >
                            <Icon size={18} />
                          </div>
                          <p className="truncate text-sm font-semibold text-gray-700">
                            {category.name}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={() => setForm(category)}
                            aria-label={`Edit ${category.name}`}
                            title="Edit"
                            className="cursor-pointer rounded p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setCategoryToDelete(category)}
                            aria-label={`Delete ${category.name}`}
                            title="Delete"
                            className="cursor-pointer rounded p-1.5 text-gray-400 hover:bg-gray-50 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {form && (
        <CategoryFormModal
          category={form.id ? form : null}
          defaultType={form.type}
          onClose={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}

      {categoryToDelete && (
        <ConfirmDialog
          title="Delete category"
          message={`"${categoryToDelete.name}" will be deleted. Categories that still have transactions can't be deleted.`}
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setCategoryToDelete(null)}
        />
      )}
    </div>
  );
};

export default Categories;
