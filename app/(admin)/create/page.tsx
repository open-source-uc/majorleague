"use client";

import { useActionState } from "react";

import { createTeam, updateTeam, deleteTeam } from "@/app/actions/teams";
import { ActionResponse } from "@/app/actions/types";
import ButtonSubmit from "@/app/components/ui/ButtonSubmit";
import Form from "@/app/components/ui/Form";
import Input from "@/app/components/ui/Input";

export default function Create() {
  const [createTeamState, createTeamAction] = useActionState(createTeam, {
    errors: 0,
    success: 0,
    message: "",
    body: {
      name: "",
      major: null,
      captain_id: null,
    },
  } as ActionResponse<any>);

  const [updateTeamState, updateTeamAction] = useActionState(updateTeam, {
    errors: 0,
    success: 0,
    message: "",
    body: {
      id: "",
      name: "",
      major: null,
      captain_id: null,
    },
  } as ActionResponse<any>);

  const [deleteTeamState, deleteTeamAction] = useActionState(deleteTeam, {
    errors: 0,
    success: 0,
    message: "",
    body: {
      id: "",
    },
  } as ActionResponse<any>);

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="mb-4 text-xl font-bold">Create Team</h2>
        <Form action={createTeamAction} className="space-y-4">
          <Input
            label="Name"
            name="name"
            type="text"
            placeholder="Team name"
            defaultValue={createTeamState.body.name}
          />
          <Input
            label="Major"
            name="major"
            type="text"
            placeholder="Team major"
            defaultValue={createTeamState.body.major || ""}
          />
          <ButtonSubmit processing={<span>Loading...</span>}>Create Team</ButtonSubmit>
          {!!createTeamState.message && (
            <p className={`text-sm ${createTeamState.success ? "text-green-500" : "text-red-500"}`}>
              {createTeamState.message}
            </p>
          )}
        </Form>
      </div>
      <div>
        <h2 className="mb-4 text-xl font-bold">Update Team</h2>
        <Form action={updateTeamAction} className="space-y-4">
          <Input
            label="Team ID (UUID)"
            name="id"
            type="text"
            placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
            defaultValue={updateTeamState.body.id}
          />
          <Input
            label="Name"
            name="name"
            type="text"
            placeholder="New team name"
            defaultValue={updateTeamState.body.name}
          />
          <Input
            label="Major"
            name="major"
            type="text"
            placeholder="New team major"
            defaultValue={updateTeamState.body.major || ""}
          />
          <ButtonSubmit processing={<span>Loading...</span>}>Update Team</ButtonSubmit>
          {!!updateTeamState.message && (
            <p className={`text-sm ${updateTeamState.success ? "text-green-500" : "text-red-500"}`}>
              {updateTeamState.message}
            </p>
          )}
        </Form>
      </div>
      <div>
        <h2 className="mb-4 text-xl font-bold">Delete Team</h2>
        <Form action={deleteTeamAction} className="space-y-4">
          <Input
            label="Team ID (UUID)"
            name="id"
            type="text"
            placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
            defaultValue={deleteTeamState.body.id}
          />
          <ButtonSubmit processing={<span>Loading...</span>}>Delete Team</ButtonSubmit>
          {!!deleteTeamState.message && (
            <p className={`text-sm ${deleteTeamState.success ? "text-green-500" : "text-red-500"}`}>
              {deleteTeamState.message}
            </p>
          )}
        </Form>
      </div>
    </div>
  );
}
