"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { waitForGlobal } from "@/lib/chart-utils";
import {
  getMasterGroups,
  createMasterGroup,
  updateMasterGroup,
  deleteMasterGroup,
} from "@/lib/masters";
import GroupFormModal, { emptyMasterGroupForm } from "@/components/master/GroupFormModal";
import MasterItemsModal from "@/components/master/MasterItemsModal";
import { formatDateTime } from "@/lib/helper/format-utils";

const columns = [
  { name: "Code", width: "150px" },
  { name: "Name", width: "150px" },
  { name: "Description", width: "150px" },
  { name: "Status", width: "180px" },
  { name: "Items", width: "180px" },
  { name: "Created at", width: "180px" },
  { name: "Actions", width: "160px" },
];

function formatRow(master) {
  return [
    master.code,
    master.name,
    master.description,
    master.is_active ? "Active" : "Inactive",
    master.items?.length ? master.items.map((item) => item.name ?? item).join(", ") : "-",
    formatDateTime(master.created_at),
  ];
}

export default function MasterGroupPage() {
  const gridRef = useRef(null);
  const gridInstance = useRef(null);
  const gridjsRef = useRef(null);
  const mastersGroupRef = useRef([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyMasterGroupForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [showItemsModal, setShowItemsModal] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState(null);

  const loadGridData = useCallback(async () => {
    const masters = await getMasterGroups();
    mastersGroupRef.current = masters;

    return masters.map((master) => [
      ...formatRow(master),
      gridjsRef.current.html(
        `<div style="white-space: nowrap;">
            <a
                href="javascript:void(0);"
                class="js-manage-items px-2 text-secondary"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                aria-label="Manage Items"
                data-bs-original-title="Manage Items"
                data-id="${master.id}">
                <i class="bx bx-list-ul font-size-18"></i>
            </a>
            <a
                href="javascript:void(0);"
                class="js-edit-master px-2 text-primary"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                aria-label="Edit"
                data-bs-original-title="Edit"
                data-id="${master.id}">
                <i class="bx bx-pencil font-size-18"></i>
            </a>
            <a
                href="javascript:void(0);"
                class="js-delete-master px-2 text-danger"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                aria-label="Delete"
                data-bs-original-title="Delete"
                data-id="${master.id}">
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
      const itemsBtn = e.target.closest(".js-manage-items");
      const editBtn = e.target.closest(".js-edit-master");
      const deleteBtn = e.target.closest(".js-delete-master");

      if (itemsBtn) openItemsModal(Number(itemsBtn.dataset.id));
      if (editBtn) openEditModal(Number(editBtn.dataset.id));
      if (deleteBtn) handleDelete(Number(deleteBtn.dataset.id));
    };
    container?.addEventListener("click", handleClick);

    return () => {
      container?.removeEventListener("click", handleClick);
      gridInstance.current?.destroy?.();
    };
  }, [renderGrid]);

  function openAddModal() {
    setForm(emptyMasterGroupForm);
    setError(null);
    setShowModal(true);
  }

  function openEditModal(id) {
    const found = mastersGroupRef.current.find((master) => master.id === id);
    if (!found) return;

    setForm({
      id: found.id,
      code: found.code,
      name: found.name,
      description: found.description,
      is_active: found.is_active,
    });
    setError(null);
    setShowModal(true);
  }

  function openItemsModal(id) {
    setActiveGroupId(id);
    setShowItemsModal(true);
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

  async function handleDelete(id) {
    const confirmed = await showDeleteConfirmation();
    if (!confirmed) return;

    try {
      await deleteMasterGroup(id);
      await Swal.fire({
        title: "Deleted!",
        text: "Master Group has been deleted.",
        icon: "success",
        confirmButtonColor: "#51d28c",
      });
      await renderGrid();
      window.dispatchEvent(new Event("master-changed"));
    } catch (err) {
      await Swal.fire({
        title: "Error!",
        text: err.message || "Failed to delete master.",
        icon: "error",
        confirmButtonColor: "#f34e4e",
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (form.id) {
        await updateMasterGroup(form.id, {
          code: form.code,
          name: form.name,
          description: form.description,
          is_active: form.is_active,
        });
      } else {
        await createMasterGroup({
          code: form.code,
          name: form.name,
          description: form.description,
        });
      }

      setShowModal(false);
      await renderGrid();
      window.dispatchEvent(new Event("master-changed"));
    } catch (err) {
      setError(err.message || "Gagal menyimpan master");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-fluid">
      <div className="row align-items-center">
        <div className="col-md-6">
          <div className="mb-3">
            <h5 className="card-title">Master Group List</h5>
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
        <GroupFormModal
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          saving={saving}
          error={error}
        />
      )}

      {showItemsModal && (
        <MasterItemsModal
          groupId={activeGroupId}
          onClose={() => setShowItemsModal(false)}
          onChanged={renderGrid}
        />
      )}
    </div>
  );
}