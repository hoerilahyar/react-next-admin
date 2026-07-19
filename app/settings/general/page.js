"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { waitForGlobal } from "@/lib/chart-utils";
import { getSettings, upsertSetting, deleteSetting } from "@/lib/setting-general";
import GeneralFormModal, { emptyGeneralForm } from "@/components/settings/GeneralFormModal";
import { formatDateTime } from "@/lib/helper/format-utils";

const columns = [
  { name: "Key" },
  { name: "Value" },
  { name: "Description" },
  { name: "Updated at" },
  { name: "Actions" },
];

function formatRow(setting) {
  return [
    setting.key,
    setting.value,
    setting.description,
    formatDateTime(setting.updated_at),
  ];
}

export default function GeneralPage() {
  const gridRef = useRef(null);
  const gridInstance = useRef(null);
  const gridjsRef = useRef(null);
  const settingRef = useRef([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyGeneralForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadGridData = useCallback(async () => {
    const setting = await getSettings();
    settingRef.current = setting;

    return setting.map((setting) => [
      ...formatRow(setting),
      gridjsRef.current.html(
        `<div style="white-space: nowrap;">
              <a
                href="javascript:void(0);"
                class="js-edit-setting px-2 text-primary"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                aria-label="Edit"
                data-bs-original-title="Edit"
                data-id="${setting.id}">
                <i class="bx bx-pencil font-size-18"></i>
            </a>
              <a
                href="javascript:void(0);"
                class="js-delete-setting px-2 text-danger"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                aria-label="Delete"
                data-bs-original-title="Delete"
                data-key="${setting.key}">
                <i class="bx bx-trash-alt font-size-18"></i>
            </a>
        </div>`
      ),
    ]);
  }, []);

  const renderGrid = useCallback(async () => {
    const gridjs = await waitForGlobal("gridjs");
    gridjsRef.current = gridjs;

    if (!gridInstance.current) {
      gridInstance.current = new gridjs.Grid({
        columns,
        pagination: true,
        sort: true,
        search: true,
        data: loadGridData,
      }).render(gridRef.current);
    } else {
      gridInstance.current.updateConfig({ data: loadGridData }).forceRender();
    }

    gridInstance.current.on("ready", () => {
      if (window.bootstrap) {
        gridRef.current
          .querySelectorAll('[data-bs-toggle="tooltip"]')
          .forEach((el) => new window.bootstrap.Tooltip(el));
      }
    });
  }, [loadGridData]);

  useEffect(() => {
    renderGrid().catch(() => { });

    const container = gridRef.current;
    const handleClick = (e) => {
      const editBtn = e.target.closest(".js-edit-setting");
      const deleteBtn = e.target.closest(".js-delete-setting");

      if (editBtn) openEditModal(Number(editBtn.dataset.id));
      if (deleteBtn) handleDelete(deleteBtn.dataset.key);
    };
    container?.addEventListener("click", handleClick);

    return () => {
      container?.removeEventListener("click", handleClick);
      gridInstance.current?.destroy?.();
    };
  }, [renderGrid]);

  function openAddModal() {
    setForm(emptyGeneralForm);
    setError(null);
    setShowModal(true);
  }

  function openEditModal(id) {
    const found = settingRef.current.find((setting) => setting.id === id);
    if (!found) return;

    setForm({
      id: found.id,
      key: found.key,
      value: found.value,
      description: found.description,
    });
    setError(null);
    setShowModal(true);
  }

  async function showDeleteConfirmation() {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#51d28c",
      cancelButtonColor: "#f34e4e",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    return result.isConfirmed;
  }

  async function handleDelete(key) {
    const confirmed = await showDeleteConfirmation();
    if (!confirmed) return;

    try {
      await deleteSetting(key);
      await Swal.fire({
        title: "Deleted!",
        text: "Setting has been deleted.",
        icon: "success",
        confirmButtonColor: "#51d28c",
      });
      await renderGrid();
      window.dispatchEvent(new Event("setting-changed"));
    } catch (err) {
      await Swal.fire({
        title: "Error!",
        text: err.message || "Failed to delete setting.",
        icon: "error",
        confirmButtonColor: "#f34e4e",
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      value: form.value,
      description: form.description,
    };

    try {
      let settingId = form.id;

      const created = await upsertSetting(payload, form.key);
      settingId = created.id ?? created.data?.id;

      setShowModal(false);
      await renderGrid();
      window.dispatchEvent(new Event("setting-changed"));
    } catch (err) {
      setError(err.message || "Gagal menyimpan setting");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-fluid">
      <div className="row align-items-center">
        <div className="col-md-6">
          <div className="mb-3">
            <h5 className="card-title">Setting List</h5>
          </div>
        </div>

        <div className="col-md-6">
          <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 mb-3">
            <div>
              <a href="#" className="btn btn-primary" onClick={openAddModal}>
                <i className="bx bx-plus me-1"></i> Add New
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <div ref={gridRef}></div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <GeneralFormModal
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          saving={saving}
          error={error}
        />
      )}
    </div>
  );
}