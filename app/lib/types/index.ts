export interface UserData {
  id: string;
  message: string;
  permissions: string[];
}

export interface Profile {
  id: string;
  username: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

// Admin object types
export interface Team {
  id: number;
  name: string;
  captain_id: string;
  captain_username?: string;
  major?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Competition {
  id: string;
  name: string;
  year: number;
  semester: number;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface Player {
  id: string;
  team_id: string;
  profile_id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  age: number;
  position: "GK" | "DEF" | "MID" | "FWD";
  created_at?: string;
  updated_at?: string;
}

export interface Match {
  id: string;
  local_team_id: string;
  visitor_team_id: string;
  competition_id: string;
  date: string;
  timestamptz: string;
  location?: string;
  status: "scheduled" | "live" | "finished" | "cancelled";
  created_at?: string;
  updated_at?: string;
}

// Object configuration for forms
export interface ObjectConfig {
  title: string;
  description: string;
  displayField: string; // Campo a usar para mostrar el nombre del objeto
  fields: FieldConfig[];
  displayColumns: DisplayColumn[];
  actions: ObjectAction[];
}

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "date" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface DisplayColumn {
  key: string;
  label: string;
  type?: "text" | "date" | "badge" | "custom";
  render?: (value: any, item: any) => string;
}

export interface ObjectAction {
  type: "create" | "edit" | "delete" | "view";
  label: string;
  icon?: string;
  variant?: "primary" | "secondary" | "danger";
}

// Object configurations
export const OBJECT_CONFIGS: Record<string, ObjectConfig> = {
  profiles: {
    title: "Perfil",
    description: "Gestionar perfiles de usuarios",
    displayField: "username",
    displayColumns: [
      { key: "username", label: "Username", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "created_at", label: "Creado", type: "date" },
    ],
    actions: [
      { type: "create", label: "Crear Perfil", variant: "primary" },
      { type: "edit", label: "Editar", variant: "secondary" },
      { type: "delete", label: "Eliminar", variant: "danger" },
    ],
    fields: [
      {
        name: "id",
        label: "ID del Usuario",
        type: "text",
        placeholder: "Ej: user123 (debe coincidir con auth.osuc.dev)",
        required: true,
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "Ej: juanperez",
        required: true,
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "Ej: juan.perez@uc.cl",
        required: false,
      },
    ],
  },
  teams: {
    title: "Equipo",
    description: "Gestionar equipos de la Major League",
    displayField: "name",
    displayColumns: [
      { key: "name", label: "Nombre", type: "text" },
      { key: "major", label: "Carrera", type: "text" },
      { key: "captain_username", label: "Capitán", type: "text" },
      { key: "created_at", label: "Creado", type: "date" },
    ],
    actions: [
      { type: "create", label: "Crear Equipo", variant: "primary" },
      { type: "edit", label: "Editar", variant: "secondary" },
      { type: "delete", label: "Eliminar", variant: "danger" },
    ],
    fields: [
      {
        name: "name",
        label: "Nombre del Equipo",
        type: "text",
        placeholder: "Ej: Minerham Forest",
        required: true,
      },
      {
        name: "major",
        label: "Carrera",
        type: "text",
        placeholder: "Ej: Ingeniería",
        required: false,
      },
      {
        name: "captain_username",
        label: "Capitán (Username)",
        type: "text",
        placeholder: "Ej: juanperez",
        required: true,
      },
    ],
  },
  competitions: {
    title: "Competición",
    description: "Gestionar competiciones y torneos",
    displayField: "name",
    displayColumns: [
      { key: "name", label: "Nombre", type: "text" },
      { key: "year", label: "Año", type: "text" },
      { key: "semester", label: "Semestre", type: "badge" },
      { key: "start_date", label: "Inicio", type: "date" },
      { key: "end_date", label: "Fin", type: "date" },
    ],
    actions: [
      { type: "create", label: "Crear Competición", variant: "primary" },
      { type: "edit", label: "Editar", variant: "secondary" },
      { type: "delete", label: "Eliminar", variant: "danger" },
    ],
    fields: [
      {
        name: "name",
        label: "Nombre de la Competición",
        type: "text",
        placeholder: "Ej: Major League 2025 - Primer Semestre",
        required: true,
      },
      {
        name: "year",
        label: "Año",
        type: "number",
        placeholder: "2025",
        required: true,
      },
      {
        name: "semester",
        label: "Semestre",
        type: "select",
        required: true,
        options: [
          { value: "1", label: "Primer Semestre" },
          { value: "2", label: "Segundo Semestre" },
        ],
      },
      {
        name: "start_date",
        label: "Fecha de Inicio",
        type: "date",
        required: true,
      },
      {
        name: "end_date",
        label: "Fecha de Fin",
        type: "date",
        required: true,
      },
    ],
  },
  players: {
    title: "Jugador",
    description: "Gestionar jugadores registrados",
    displayField: "first_name",
    displayColumns: [
      { key: "first_name", label: "Nombre", type: "text" },
      { key: "last_name", label: "Apellido", type: "text" },
      { key: "nickname", label: "Apodo", type: "text" },
      { key: "age", label: "Edad", type: "text" },
      { key: "position", label: "Posición", type: "badge" },
    ],
    actions: [
      { type: "create", label: "Crear Jugador", variant: "primary" },
      { type: "edit", label: "Editar", variant: "secondary" },
      { type: "delete", label: "Eliminar", variant: "danger" },
    ],
    fields: [
      {
        name: "first_name",
        label: "Nombre",
        type: "text",
        placeholder: "Juan",
        required: true,
      },
      {
        name: "last_name",
        label: "Apellido",
        type: "text",
        placeholder: "Pérez",
        required: true,
      },
      {
        name: "nickname",
        label: "Apodo",
        type: "text",
        placeholder: "Juanito",
        required: false,
      },
      {
        name: "age",
        label: "Edad",
        type: "number",
        placeholder: "22",
        required: true,
      },
      {
        name: "position",
        label: "Posición",
        type: "select",
        required: true,
        options: [
          { value: "GK", label: "Portero (GK)" },
          { value: "DEF", label: "Defensa (DEF)" },
          { value: "MID", label: "Mediocampo (MID)" },
          { value: "FWD", label: "Delantero (FWD)" },
        ],
      },
    ],
  },
  matches: {
    title: "Partido",
    description: "Gestionar partidos programados",
    displayField: "date",
    displayColumns: [
      { key: "date", label: "Fecha", type: "date" },
      { key: "local_team_id", label: "Local", type: "text" },
      { key: "visitor_team_id", label: "Visitante", type: "text" },
      { key: "location", label: "Ubicación", type: "text" },
      { key: "status", label: "Estado", type: "badge" },
    ],
    actions: [
      { type: "create", label: "Crear Partido", variant: "primary" },
      { type: "edit", label: "Editar", variant: "secondary" },
      { type: "delete", label: "Eliminar", variant: "danger" },
    ],
    fields: [
      {
        name: "date",
        label: "Fecha del Partido",
        type: "date",
        required: true,
      },
      {
        name: "location",
        label: "Ubicación",
        type: "text",
        placeholder: "Cancha UC",
        required: false,
      },
    ],
  },
};
