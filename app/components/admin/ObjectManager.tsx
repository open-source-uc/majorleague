"use client";

import { useState, useActionState } from "react";

import { OBJECT_CONFIGS, type FieldConfig, type DisplayColumn } from "@/lib/types";

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

  const renderField = (field: FieldConfig, defaultValue = "") => {
    // Convert datetime format for datetime-local inputs
    let processedDefaultValue = defaultValue;
    if (field.type === "datetime-local" && defaultValue) {
      // Convert from "YYYY-MM-DD HH:MM:SS" to "YYYY-MM-DDTHH:MM" format
      processedDefaultValue = defaultValue.replace(" ", "T").substring(0, 16);
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
          <div key={field.name} className="flex w-full flex-col space-y-2">
            <label htmlFor={field.name} className="text-foreground text-md">
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
              className="border-border-header bg-background-header placeholder-foreground/50 text-foreground invalid:text-foreground/50 focus:border-primary focus:ring-primary w-full rounded-lg border-2 p-4 focus:ring-2 focus:outline-hidden"
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
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
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
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground font-heading text-2xl font-bold">{config.title}</h1>
          <p className="text-ml-grey">{config.description}</p>
        </div>
        <button
          onClick={() => openModal("create")}
          className="bg-primary text-background hover:bg-primary-darken flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors"
        >
          <span>+</span>
          {config.actions.find((a) => a.type === "create")?.label}
        </button>
      </div>

      {/* Data Grid */}
      <div className="bg-background-header border-border-header overflow-hidden rounded-lg border-2 shadow-sm">
        {data.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-ml-grey">No hay {config.title.toLowerCase()} registrados</p>
            <button
              onClick={() => openModal("create")}
              className="text-primary hover:text-primary-darken mt-4 font-medium"
            >
              Crear el primer {config.title.toLowerCase()}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="divide-border-header min-w-full divide-y">
              <thead className="bg-background">
                <tr>
                  {config.displayColumns.map((column) => (
                    <th
                      key={column.key}
                      className="text-ml-grey px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="text-ml-grey px-6 py-3 text-right text-xs font-medium tracking-wider uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background-header divide-border-header divide-y">
                {data.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-background">
                    {config.displayColumns.map((column) => (
                      <td key={column.key} className="text-foreground px-6 py-4 text-sm whitespace-nowrap">
                        {renderCellValue(column, item)}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal("edit", item)}
                          className="text-primary hover:text-primary-darken text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openModal("delete", item)}
                          className="text-sm font-medium text-red-400 hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalType ? (
        <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-black">
          <div className="bg-background-header border-border-header relative top-20 mx-auto w-full max-w-2xl rounded-lg border-2 p-5 shadow-lg">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-foreground font-heading text-lg font-medium">
                  {modalType === "create" && `Crear ${config.title}`}
                  {modalType === "edit" && `Editar ${config.title}`}
                  {modalType === "delete" && `Eliminar ${config.title}`}
                </h3>
                <button onClick={closeModal} className="text-ml-grey hover:text-foreground">
                  <span className="sr-only">Cerrar</span>✕
                </button>
              </div>

              {/* Modal Content */}
              {modalType === "delete" ? (
                <div>
                  <p className="text-ml-grey mb-4 text-sm">
                    ¿Estás seguro de que quieres eliminar este {config.title.toLowerCase()}? Esta acción no se puede
                    deshacer.
                  </p>
                  {selectedItem ? (
                    <div className="bg-background border-border-header mb-4 rounded-lg border p-3">
                      <p className="text-foreground font-medium">{selectedItem[config.displayField] || "Item"}</p>
                    </div>
                  ) : null}
                  {currentAction ? (
                    <Form action={currentAction} className="space-y-4">
                      <input type="hidden" name="id" value={selectedItem?.id} />

                      {currentState?.message ? (
                        <div
                          className={`rounded-lg p-4 ${
                            currentState.success
                              ? "border border-green-600 bg-green-900/20"
                              : "border border-red-600 bg-red-900/20"
                          }`}
                        >
                          <p className={`text-sm ${currentState.success ? "text-green-400" : "text-red-400"}`}>
                            {currentState.message}
                          </p>
                        </div>
                      ) : null}

                      <div className="flex gap-4 pt-4">
                        <ButtonSubmit
                          processing={<span>Eliminando...</span>}
                          className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                        >
                          Eliminar
                        </ButtonSubmit>
                        <button
                          type="button"
                          onClick={closeModal}
                          className="bg-background-header border-border-header text-ml-grey hover:text-foreground rounded-lg border px-4 py-2 font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </Form>
                  ) : null}
                </div>
              ) : (
                currentAction && (
                  <Form action={currentAction} className="space-y-4">
                    {modalType === "edit" && <input type="hidden" name="id" value={selectedItem?.id} />}

                    {config.fields.map((field) => renderField(field, selectedItem?.[field.name] || ""))}

                    {currentState?.message ? (
                      <div
                        className={`rounded-lg p-4 ${
                          currentState.success
                            ? "border border-green-600 bg-green-900/20"
                            : "border border-red-600 bg-red-900/20"
                        }`}
                      >
                        <p className={`text-sm ${currentState.success ? "text-green-400" : "text-red-400"}`}>
                          {currentState.message}
                        </p>
                      </div>
                    ) : null}

                    <div className="flex gap-4 pt-4">
                      <ButtonSubmit
                        processing={<span>{modalType === "create" ? "Creando..." : "Guardando..."}</span>}
                        className="bg-primary text-background hover:bg-primary-darken rounded-lg px-4 py-2 font-medium"
                      >
                        {modalType === "create" ? "Crear" : "Guardar"}
                      </ButtonSubmit>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="bg-background-header border-border-header text-ml-grey hover:text-foreground rounded-lg border px-4 py-2 font-medium"
                      >
                        Cancelar
                      </button>
                    </div>
                  </Form>
                )
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
