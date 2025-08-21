"use client";

import { useState, useActionState, useEffect } from "react";

import { OBJECT_CONFIGS, type FieldConfig, type DisplayColumn } from "@/lib/types";

import Button from "../ui/Button";
import ButtonSubmit from "../ui/ButtonSubmit";
import Form from "../ui/Form";
import Input from "../ui/Input";
import Select from "../ui/Select";

interface ObjectManagerProps {
  objType: string;
  data: any[];
  createAction: any;
  updateAction: any;
  deleteAction: any;
  dynamicOptions?: Record<string, { value: string; label: string }[]>;
}

type ModalType = "create" | "edit" | "delete" | null;

export default function ObjectManager({
  objType,
  data,
  createAction,
  updateAction,
  deleteAction,
  dynamicOptions,
}: ObjectManagerProps) {
  const config = OBJECT_CONFIGS[objType];
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [createState, createFormAction, createPending] = useActionState(createAction, {
    success: 0,
    errors: 0,
    message: "",
    body: {},
  });

  const [updateState, updateFormAction, updatePending] = useActionState(updateAction, {
    success: 0,
    errors: 0,
    message: "",
    body: {},
  });

  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteAction, {
    success: 0,
    errors: 0,
    message: "",
    body: {},
  });

  const openModal = (type: ModalType, item?: any) => {
    setModalType(type);
    setSelectedItem(item || null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedItem(null);
  };

  // Close modal on successful actions
  useEffect(() => {
    if (createState.success || updateState.success || deleteState.success) {
      const timer = setTimeout(() => {
        closeModal();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [createState.success, updateState.success, deleteState.success]);

  // Handle escape key and backdrop click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalType) {
        closeModal();
      }
    };

    if (modalType) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [modalType]);

  if (!config) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <h2 className="font-semibold text-red-800">Error</h2>
        <p className="text-red-700">Tipo de objeto no válido: {objType}</p>
      </div>
    );
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const renderField = (field: FieldConfig, defaultValue = "") => {
    // Convert datetime format for datetime-local inputs
    let processedDefaultValue = defaultValue;
    if (field.type === "datetime" && defaultValue) {
      // Convert from "YYYY-MM-DD HH:MM:SS" to "YYYY-MM-DDTHH:MM" format
      // Handle both space and T separators
      if (defaultValue.includes(" ")) {
        processedDefaultValue = defaultValue.replace(" ", "T").substring(0, 16);
      } else if (defaultValue.includes("T")) {
        processedDefaultValue = defaultValue.substring(0, 16);
      }
    }

    const commonProps = {
      name: field.name,
      label: field.label,
      required: field.required || false,
      defaultValue: processedDefaultValue,
    };

    switch (field.type) {
      case "select":
        const options =
          field.dataSource && dynamicOptions?.[field.dataSource]
            ? dynamicOptions[field.dataSource]
            : field.options || [];
        return <Select key={field.name} {...commonProps} options={options} />;
      case "boolean":
        return (
          <div key={field.name} className="space-y-2">
            <label htmlFor={field.name} className="text-foreground text-sm font-medium">
              {field.label}
              {field.required ? <span className="text-primary ml-1">*</span> : null}
            </label>
            <select
              id={field.name}
              name={field.name}
              defaultValue={String(!!processedDefaultValue)}
              className="border-border/50 bg-background/95 text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border p-3 focus:ring-2 focus:outline-none"
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
        );
      case "textarea":
        return (
          <div key={field.name} className="space-y-2">
            <label htmlFor={field.name} className="text-foreground text-sm font-medium">
              {field.label}
              {field.required ? <span className="text-primary ml-1">*</span> : null}
            </label>
            <textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              defaultValue={processedDefaultValue}
              rows={3}
              className="border-border/50 bg-background/95 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border p-3 focus:ring-2 focus:outline-none"
            />
          </div>
        );
      case "datetime":
        return (
          <div key={field.name} className="flex w-full flex-col space-y-2">
            <Input {...commonProps} type="datetime-local" placeholder={field.placeholder || ""} />
            {field.helpText ? <span className="text-ml-grey text-xs">{field.helpText}</span> : null}
          </div>
        );
      default:
        return (
          <div key={field.name} className="flex w-full flex-col space-y-2">
            <Input {...commonProps} type={field.type} placeholder={field.placeholder || ""} />
            {field.helpText ? <span className="text-ml-grey text-xs">{field.helpText}</span> : null}
          </div>
        );
    }
  };

  const renderCellValue = (column: DisplayColumn, item: any) => {
    const value = item[column.key];

    if (!value && value !== 0) return "-";

    switch (column.type) {
      case "date":
        if (value.includes("T")) {
          // If it's a datetime string, just take the date part
          return value.split("T")[0];
        } else if (value.includes("-")) {
          // If it's already a date string (YYYY-MM-DD), return as is
          return value;
        } else {
          // Otherwise format as date
          return new Date(value).toLocaleDateString("es-ES");
        }
      case "datetime":
        return new Date(value).toLocaleString("es-CL", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      case "badge":
        return (
          <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
            {value}
          </span>
        );
      case "boolean":
        return (
          <span
            className={
              `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ` +
              (value ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive")
            }
          >
            {value ? "Sí" : "No"}
          </span>
        );
      case "custom":
        return column.render ? column.render(value, item) : value;
      default:
        return String(value);
    }
  };

  const currentState =
    modalType === "create"
      ? createState
      : modalType === "edit"
        ? updateState
        : modalType === "delete"
          ? deleteState
          : null;

  const currentAction =
    modalType === "create"
      ? createFormAction
      : modalType === "edit"
        ? updateFormAction
        : modalType === "delete"
          ? deleteFormAction
          : null;

  return (
    <div className="tablet:p-6 desktop:p-8 space-y-8 p-4">
      {/* Clean Header Section */}
      <div className="tablet:flex-row tablet:items-center tablet:justify-between flex flex-col gap-4">
        <div className="space-y-2">
          <h1 className="text-foreground tablet:text-3xl text-2xl font-bold">{config.title}</h1>
          <p className="text-muted-foreground">{config.description}</p>
          {config.dynamicHelp ? <p className="text-muted-foreground text-sm">{config.dynamicHelp}</p> : null}
        </div>
        <Button
          onClick={() => openModal("create")}
          size="lg"
          className="group from-primary to-primary/90 tablet:w-auto relative w-full overflow-hidden bg-gradient-to-r transition-all duration-300 hover:scale-105 hover:shadow-lg"
          aria-label={`Crear nuevo ${config.title.toLowerCase()}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl transition-transform duration-300 group-hover:rotate-90">+</span>
            <span className="font-semibold">{config.actions.find((a) => a.type === "create")?.label}</span>
          </div>
          <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
        </Button>
      </div>

      {/* Clean Data Grid */}
      <div className="border-border/50 bg-card/95 overflow-hidden rounded-xl border shadow-sm backdrop-blur-sm">
        {data.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mb-4 text-4xl">📊</div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              No hay {config.title.toLowerCase()} registrados
            </h3>
            <p className="text-muted-foreground mb-6">Comienza creando tu primer registro</p>
            <Button
              onClick={() => openModal("create")}
              variant="outline"
              size="lg"
              className="group hover:border-primary relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg"
              aria-label={`Crear primer ${config.title.toLowerCase()}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl transition-transform duration-300 group-hover:rotate-180">✨</span>
                <span className="font-semibold">Crear el primer {config.title.toLowerCase()}</span>
              </div>
              <div className="via-primary/10 absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="divide-border/30 min-w-full divide-y">
              <thead className="bg-muted/30">
                <tr>
                  {config.displayColumns.map((column) => (
                    <th
                      key={column.key}
                      className="text-muted-foreground px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="text-muted-foreground px-6 py-4 text-right text-xs font-semibold tracking-wider uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border/20 bg-card/50 divide-y">
                {data.map((item, index) => (
                  <tr key={item.id || index} className="group hover:bg-muted/20 transition-colors">
                    {config.displayColumns.map((column) => (
                      <td key={column.key} className="text-foreground px-6 py-4 text-sm whitespace-nowrap">
                        {renderCellValue(column, item)}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1">
                        <Button
                          onClick={() => openModal("edit", item)}
                          variant="ghost"
                          size="sm"
                          className="group relative overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-md"
                          aria-label={`Editar ${config.title.toLowerCase()}: ${item[config.displayField] || "elemento"}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg transition-transform group-hover:scale-110">✏️</span>
                            <span className="text-sm font-medium">Editar</span>
                          </div>
                        </Button>
                        <Button
                          onClick={() => openModal("delete", item)}
                          variant="ghost"
                          size="sm"
                          className="group text-muted-foreground hover:bg-destructive/10 hover:text-destructive relative overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-md"
                          aria-label={`Eliminar ${config.title.toLowerCase()}: ${item[config.displayField] || "elemento"}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg transition-transform group-hover:scale-110">🗑️</span>
                            <span className="text-sm font-medium">Eliminar</span>
                          </div>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {modalType ? (
        <div
          className="animate-in fade-in-0 fixed inset-0 z-50 flex items-center justify-center p-4 duration-300"
          onClick={handleBackdropClick}
        >
          {/* Enhanced Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal Container */}
          <div
            className="animate-in zoom-in-95 relative w-full max-w-2xl duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle glow effect */}
            <div className="from-primary/20 to-accent/20 absolute -inset-4 rounded-2xl bg-gradient-to-r opacity-60 blur-xl" />

            {/* Modal Content */}
            <div className="border-border/30 bg-card/98 relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md">
              {/* Header with gradient */}
              <div className="border-border/20 from-muted/50 to-muted/30 relative border-b bg-gradient-to-r px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {modalType === "create" && "✨"}
                      {modalType === "edit" && "✏️"}
                      {modalType === "delete" && "🗑️"}
                    </div>
                    <h3 id="modal-title" className="text-foreground text-xl font-bold">
                      {modalType === "create" && `Crear ${config.title}`}
                      {modalType === "edit" && `Editar ${config.title}`}
                      {modalType === "delete" && `Eliminar ${config.title}`}
                    </h3>
                  </div>

                  <Button
                    onClick={closeModal}
                    variant="ghost"
                    size="sm"
                    className="group hover:bg-muted/60 h-10 w-10 rounded-full p-0 transition-all duration-200 hover:scale-110 hover:rotate-90"
                    aria-label="Cerrar modal"
                  >
                    <span className="text-muted-foreground group-hover:text-foreground text-xl font-light transition-colors">
                      ×
                    </span>
                  </Button>
                </div>
              </div>

              {/* Enhanced Modal Body */}
              <div className="max-h-[70vh] overflow-y-auto px-8 py-6">
                {modalType === "delete" ? (
                  <div className="space-y-6">
                    {/* Warning Section */}
                    <div className="border-muted bg-card rounded-xl border p-6 text-center">
                      <div className="mb-4 text-5xl">⚠️</div>
                      <h4 className="text-foreground mb-3 text-lg font-semibold">Confirmar eliminación</h4>
                      <p className="text-accent">
                        ¿Estás seguro de que quieres eliminar este {config.title.toLowerCase()}?
                        <br />
                        <span className="font-semibold">Esta acción no se puede deshacer.</span>
                      </p>
                    </div>

                    {/* Item Preview */}
                    {selectedItem ? (
                      <div className="border-border/50 bg-muted/30 rounded-xl border p-6">
                        <div className="text-center">
                          <p className="text-muted-foreground mb-1 text-sm font-medium">Se eliminará:</p>
                          <p className="text-foreground text-lg font-bold">
                            {selectedItem[config.displayField] || "Item"}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {/* Form */}
                    {currentAction ? (
                      <Form action={currentAction} className="space-y-6">
                        <input type="hidden" name="id" value={selectedItem?.id} />

                        {/* Status Message */}
                        {currentState?.message ? (
                          <div
                            className={`rounded-xl border p-4 ${
                              currentState.success
                                ? "border-green-500/30 bg-green-500/10 text-green-600"
                                : "border-destructive/30 bg-destructive/10 text-destructive"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{currentState.success ? "✅" : "❌"}</span>
                              <span className="font-medium">{currentState.message}</span>
                            </div>
                          </div>
                        ) : null}

                        {/* Action Buttons */}
                        <div className="tablet:flex-row tablet:justify-end flex flex-col-reverse gap-4">
                          <Button
                            type="button"
                            onClick={closeModal}
                            variant="outline"
                            size="lg"
                            className="group tablet:w-auto relative w-full overflow-hidden transition-all duration-200 hover:scale-105"
                            aria-label="Cancelar eliminación"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">↩️</span>
                              <span className="font-semibold">Cancelar</span>
                            </div>
                          </Button>
                          <ButtonSubmit
                            processing={
                              <span className="flex items-center justify-center gap-2">
                                <div className="border-destructive-foreground h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                                <span className="font-semibold">Eliminando...</span>
                              </span>
                            }
                            className="group bg-destructive text-destructive-foreground hover:bg-destructive/90 tablet:w-auto relative h-12 w-full overflow-hidden px-8 text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                            aria-label="Confirmar eliminación"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg transition-transform group-hover:scale-110">🗑️</span>
                              <span className="font-bold">Eliminar</span>
                            </div>
                            <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
                          </ButtonSubmit>
                        </div>
                      </Form>
                    ) : null}
                  </div>
                ) : (
                  currentAction && (
                    <Form action={currentAction} className="space-y-6">
                      {modalType === "edit" && <input type="hidden" name="id" value={selectedItem?.id} />}

                      {/* Form Fields */}
                      <div className="space-y-6">
                        {config.fields.map((field) => (
                          <div key={field.name} className="space-y-2">
                            {renderField(field, selectedItem?.[field.name] || "")}
                          </div>
                        ))}
                      </div>

                      {/* Status Message */}
                      {currentState?.message ? (
                        <div
                          className={`rounded-xl border p-4 ${
                            currentState.success
                              ? "border-green-500/30 bg-green-500/10 text-green-600"
                              : "border-destructive/30 bg-destructive/10 text-destructive"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{currentState.success ? "✅" : "❌"}</span>
                            <span className="font-medium">{currentState.message}</span>
                          </div>
                        </div>
                      ) : null}

                      {/* Action Buttons */}
                      <div className="tablet:flex-row tablet:justify-end border-border/20 flex flex-col-reverse gap-3 border-t pt-4">
                        <Button
                          type="button"
                          onClick={closeModal}
                          variant="outline"
                          size="lg"
                          className="tablet:w-auto w-full"
                        >
                          Cancelar
                        </Button>
                        <ButtonSubmit
                          processing={
                            <span className="flex items-center justify-center gap-2">
                              <div className="border-primary-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                              {modalType === "create" ? "Creando..." : "Guardando..."}
                            </span>
                          }
                          className="tablet:w-auto h-12 w-full px-6 text-lg"
                        >
                          <span className="mr-2">{modalType === "create" ? "✨" : "💾"}</span>
                          {modalType === "create" ? "Crear" : "Guardar"}
                        </ButtonSubmit>
                      </div>
                    </Form>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
