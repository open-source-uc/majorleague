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

  if (!config) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <h2 className="font-semibold text-red-800">Error</h2>
        <p className="text-red-700">Tipo de objeto no válido: {objType}</p>
      </div>
    );
  }

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const renderField = (field: FieldConfig, defaultValue = "") => {
    // Convert datetime format for datetime-local inputs
    let processedDefaultValue = defaultValue;
    if (field.type === "datetime-local" && defaultValue) {
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
      case "textarea":
        return (
          <div key={field.name} className="space-y-2">
            <label htmlFor={field.name} className="text-sm font-medium text-foreground">
              {field.label}
              {field.required ? <span className="ml-1 text-primary">*</span> : null}
            </label>
            <textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              defaultValue={processedDefaultValue}
              rows={3}
              className="w-full rounded-lg border border-border/50 bg-background/95 p-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        );
      case "datetime-local":
        return <Input key={field.name} {...commonProps} type="datetime-local" placeholder={field.placeholder || ""} />;
      default:
        return <Input key={field.name} {...commonProps} type={field.type} placeholder={field.placeholder || ""} />;
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
      case "badge":
        return (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {value}
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
    <div className="space-y-8 p-4 tablet:p-6 desktop:p-8">
      {/* Clean Header Section */}
      <div className="flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground tablet:text-3xl">{config.title}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
        <Button
          onClick={() => openModal("create")}
          size="lg"
          className="group relative w-full overflow-hidden bg-gradient-to-r from-primary to-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg tablet:w-auto"
          aria-label={`Crear nuevo ${config.title.toLowerCase()}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl transition-transform duration-300 group-hover:rotate-90">+</span>
            <span className="font-semibold">{config.actions.find((a) => a.type === "create")?.label}</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </Button>
      </div>

      {/* Clean Data Grid */}
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card/95 shadow-sm backdrop-blur-sm">
        {data.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mb-4 text-4xl">📊</div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No hay {config.title.toLowerCase()} registrados</h3>
            <p className="mb-6 text-muted-foreground">Comienza creando tu primer registro</p>
            <Button
              onClick={() => openModal("create")}
              variant="outline"
              size="lg"
              className="group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:border-primary hover:shadow-lg"
              aria-label={`Crear primer ${config.title.toLowerCase()}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl transition-transform duration-300 group-hover:rotate-180">✨</span>
                <span className="font-semibold">Crear el primer {config.title.toLowerCase()}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/30">
              <thead className="bg-muted/30">
                <tr>
                  {config.displayColumns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 bg-card/50">
                {data.map((item, index) => (
                  <tr key={item.id || index} className="group hover:bg-muted/20 transition-colors">
                    {config.displayColumns.map((column) => (
                      <td key={column.key} className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
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
                          aria-label={`Editar ${config.title.toLowerCase()}: ${item[config.displayField] || 'elemento'}`}
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
                          className="group relative overflow-hidden text-muted-foreground transition-all duration-200 hover:scale-105 hover:bg-destructive/10 hover:text-destructive hover:shadow-md"
                          aria-label={`Eliminar ${config.title.toLowerCase()}: ${item[config.displayField] || 'elemento'}`}
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
      {modalType && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in-0 duration-300"
          onClick={handleBackdropClick}
        >
          {/* Enhanced Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Modal Container */}
          <div
            className="relative w-full max-w-2xl animate-in zoom-in-95 duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle glow effect */}
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 opacity-60 blur-xl" />
            
            {/* Modal Content */}
            <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/98 shadow-2xl backdrop-blur-md">
              {/* Header with gradient */}
              <div className="relative border-b border-border/20 bg-gradient-to-r from-muted/50 to-muted/30 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {modalType === "create" && "✨"}
                      {modalType === "edit" && "✏️"}
                      {modalType === "delete" && "🗑️"}
                    </div>
                    <h3 id="modal-title" className="text-xl font-bold text-foreground">
                      {modalType === "create" && `Crear ${config.title}`}
                      {modalType === "edit" && `Editar ${config.title}`}
                      {modalType === "delete" && `Eliminar ${config.title}`}
                    </h3>
                  </div>
                  
                  <Button
                    onClick={closeModal}
                    variant="ghost"
                    size="sm"
                    className="group h-10 w-10 rounded-full p-0 transition-all duration-200 hover:bg-muted/60 hover:scale-110 hover:rotate-90"
                    aria-label="Cerrar modal"
                  >
                    <span className="text-xl font-light text-muted-foreground transition-colors group-hover:text-foreground">×</span>
                  </Button>
                </div>
              </div>

              {/* Enhanced Modal Body */}
              <div className="max-h-[70vh] overflow-y-auto px-8 py-6">
                {modalType === "delete" ? (
                  <div className="space-y-6">
                    {/* Warning Section */}
                    <div className="rounded-xl border border-muted bg-card p-6 text-center">
                      <div className="mb-4 text-5xl">⚠️</div>
                      <h4 className="mb-3 text-lg font-semibold text-foreground">
                        Confirmar eliminación
                      </h4>
                      <p className="text-accent">
                        ¿Estás seguro de que quieres eliminar este {config.title.toLowerCase()}? 
                        <br />
                        <span className="font-semibold">Esta acción no se puede deshacer.</span>
                      </p>
                    </div>

                    {/* Item Preview */}
                    {selectedItem && (
                      <div className="rounded-xl border border-border/50 bg-muted/30 p-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Se eliminará:</p>
                          <p className="text-lg font-bold text-foreground">
                            {selectedItem[config.displayField] || "Item"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Form */}
                    {currentAction && (
                      <Form action={currentAction} className="space-y-6">
                        <input type="hidden" name="id" value={selectedItem?.id} />

                        {/* Status Message */}
                        {currentState?.message && (
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
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse gap-4 tablet:flex-row tablet:justify-end">
                          <Button
                            type="button"
                            onClick={closeModal}
                            variant="outline"
                            size="lg"
                            className="group relative w-full overflow-hidden transition-all duration-200 hover:scale-105 tablet:w-auto"
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
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent" />
                                <span className="font-semibold">Eliminando...</span>
                              </span>
                            }
                            className="group relative w-full overflow-hidden bg-destructive text-destructive-foreground transition-all duration-200 hover:scale-105 hover:bg-destructive/90 hover:shadow-lg tablet:w-auto h-12 px-8 text-lg"
                            aria-label="Confirmar eliminación"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg transition-transform group-hover:scale-110">🗑️</span>
                              <span className="font-bold">Eliminar</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          </ButtonSubmit>
                        </div>
                      </Form>
                    )}
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
                      {currentState?.message && (
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
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col-reverse gap-3 tablet:flex-row tablet:justify-end pt-4 border-t border-border/20">
                        <Button
                          type="button"
                          onClick={closeModal}
                          variant="outline"
                          size="lg"
                          className="w-full tablet:w-auto"
                        >
                          Cancelar
                        </Button>
                        <ButtonSubmit
                          processing={
                            <span className="flex items-center justify-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                              {modalType === "create" ? "Creando..." : "Guardando..."}
                            </span>
                          }
                          className="w-full tablet:w-auto h-12 px-6 text-lg"
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
      )}
    </div>
  );
}
