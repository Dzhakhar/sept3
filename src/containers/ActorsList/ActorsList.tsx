import { FC, useCallback, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {
  useGetActorsQuery,
  useUpdateActorMutation,
  useDeleteActorMutation,
} from "@services/actors";
import { Button } from "primereact/button";
import { Controller, useForm } from "react-hook-form";
import { Actor } from "@utils/db";
import { InputText } from "primereact/inputtext";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { categoryTags } from "./categoryTags";

export const ActorsList: FC = () => {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const { control, reset } = useForm<Actor>();
  // I just found out that primereact does the sorting by itself
  // but still will pass the sorting parameters for initial sorting.
  const { data: actors, isLoading } = useGetActorsQuery({
    sortBy: "n",
    order: "asc",
  });

  const [updateActor] = useUpdateActorMutation();
  const [deleteActor] = useDeleteActorMutation();

  const saveChanges = useCallback(async () => {
    await updateActor({
      id: editingRow,
      n: control._formValues["n"],
      c: control._formValues["c"],
    });
    setEditingRow(null);
    reset();
  }, [setEditingRow, updateActor, editingRow, control, reset]);

  const startEditing = useCallback(
    (rowData: Actor) => {
      reset();
      setEditingRow(rowData.id);
    },
    [setEditingRow],
  );

  const deleteRow = useCallback(
    async (actor: Actor) => {
      deleteActor(actor);
    },
    [deleteActor],
  );

  const cancelEditing = useCallback(() => {
    setEditingRow(null);
    reset();
  }, [setEditingRow, reset]);

  const isEditing = useCallback(
    (rowId: number) => editingRow === rowId,
    [editingRow],
  );

  const nameEditor = useCallback(
    (rowData: Actor) => (
      <Controller
        name="n"
        control={control}
        defaultValue={rowData.n}
        render={({ field }) => (<InputText {...field} />)}
      />
    ),
    [control],
  );

  const categoriesEditor = useCallback(
    (rowData: Actor) => (
      <Controller
        name="c"
        control={control}
        defaultValue={rowData.c}
        render={({ field }) => (
          <MultiSelect
            className={"max-w-[400px]"}
            value={field.value}
            optionValue={"value"}
            optionLabel={"label"}
            options={categoryTags}
            onChange={(e: MultiSelectChangeEvent) => field.onChange(e.value)}
            placeholder={"Select Categories"}
            display={"chip"}
          />
        )}
      />
    ),
    [control],
  );

  const actionBodyTemplate = useCallback(
    (rowData: Actor) => {
      return isEditing(rowData.id) ? (
        <div className={"flex gap-x-2"}>
          <Button
            icon={"pi pi-times"}
            rounded
            outlined
            severity={"danger"}
            onClick={cancelEditing}
          />
          <Button icon={"pi pi-check"} rounded outlined onClick={saveChanges} />
        </div>
      ) : (
        <div className={"flex gap-x-2"}>
          <Button
            icon={"pi pi-trash"}
            rounded
            outlined
            severity={"danger"}
            onClick={() => deleteRow(rowData)}
          />
          <Button
            icon={"pi pi-pencil"}
            rounded
            outlined
            onClick={() => startEditing(rowData)}
          />
        </div>
      );
    },
    [startEditing, isEditing, deleteRow, saveChanges, cancelEditing],
  );

  const categoriesBodyTemplate = useCallback(
    (rowData: Actor) => {
      if (isEditing(rowData.id)) {
        return categoriesEditor(rowData);
      }
      return rowData.c.join(", ");
    },
    [isEditing, categoriesEditor],
  );

  const nameBodyTemplate = useCallback(
    (rowData: Actor) => {
      if (isEditing(rowData.id)) {
        return nameEditor(rowData);
      }
      return (<span>{rowData.n}</span>);
    },
    [isEditing, categoriesEditor],
  );

  return (
    <div>
      <DataTable
        loading={isLoading}
        id={"id"}
        value={actors}
        editingRows={editingRow ? { [editingRow]: true } : undefined}
      >
        <Column
          field={"n"}
          header={"Name"}
          sortable
          style={{ width: "40%" }}
          body={nameBodyTemplate}
        ></Column>
        <Column
          field={"c"}
          header={"Category"}
          sortable
          style={{ width: "40%" }}
          body={categoriesBodyTemplate}
        ></Column>
        <Column
          header={"Actions"}
          style={{ width: "20%" }}
          body={actionBodyTemplate}
        ></Column>
      </DataTable>
    </div>
  );
};
