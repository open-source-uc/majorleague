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

export interface TeamPage {
  id: number;
  team_id: number;
  description?: string;
  instagram_handle?: string;
  captain_email?: string;
  founded_year?: number;
  achievements?: string; // JSON array
  motto?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Competition {
  id: number;
  name: string;
  year: number;
  semester: number;
  start_timestamp: string;
  end_timestamp: string;
  created_at?: string;
}

export interface Player {
  id: number;
  team_id: number | null;
  profile_id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  jersey_number?: number;
  birthday: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  created_at?: string;
  updated_at?: string;
}

export interface Match {
  id: number;
  local_team_id: number;
  visitor_team_id: number;
  competition_id: number;
  timestamp: string;
  location?: string;
  local_score: number;
  visitor_score: number;
  status: "scheduled" | "live" | "finished" | "cancelled" | "in_review";
  created_at?: string;
  updated_at?: string;
}

export interface NextMatch {
  date: string;
  time: string;
  local_team_name: string;
  visitor_team_name: string;
  status: "scheduled" | "live" | "finished" | "cancelled" | "in_review";
}

// New entity types
export interface Stream {
  id: number;
  stream_date: string; // YYYY-MM-DD
  url: string;
  youtube_video_id: string;
  is_live_stream: boolean;
  is_featured: boolean;
  title?: string;
  thumbnail_url?: string;
  published_at?: string;
  duration_seconds?: number;
  start_time?: string;
  end_time?: string;
  notes?: string;
  created_at?: string;
}

export interface Notification {
  id: number;
  profile_id: string;
  match_id?: number;
  preference_id?: number;
  sent_at?: string;
  is_enabled: boolean;
  status: "pending" | "sent" | "failed";
  delivery_info?: string;
  created_at?: string;
}

export interface Preference {
  id: number;
  profile_id: string;
  type: "notification" | "privacy" | "display";
  channel: string;
  lead_time_minutes: number;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface JoinTeamRequest {
  id: number;
  team_id: number;
  profile_id: string;
  timestamp: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  birthday: string;
  preferred_position: "GK" | "DEF" | "MID" | "FWD";
  preferred_jersey_number?: number;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Lineup {
  id: number;
  team_id: number;
  match_id: number;
  timestamp: string;
  matrix?: string;
  created_at?: string;
}

export interface Event {
  id: number;
  match_id: number;
  team_id: number;
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "other";
  minute: number;
  description?: string;
  created_at?: string;
}

export interface TeamCompetition {
  id: number;
  team_id: number;
  competition_id: number;
  points: number;
  position: number;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  created_at?: string;
}

// Object configuration for forms
export interface ObjectConfig {
  title: string;
  description: string;
  displayField: string; // Campo a usar para mostrar el nombre del objeto
  fields: FieldConfig[];
  displayColumns: DisplayColumn[];
  actions: ObjectAction[];
  dynamicHelp?: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "date" | "datetime" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  dataSource?: string; // For dynamic select options
  helpText?: string;
}

export interface DisplayColumn {
  key: string;
  label: string;
  type?: "text" | "date" | "datetime" | "badge" | "custom" | "number" | "boolean";
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
      { key: "id", label: "ID", type: "text" },
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
      { key: "start_timestamp", label: "Inicio", type: "date" },
      { key: "end_timestamp", label: "Fin", type: "date" },
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
        name: "start_timestamp",
        label: "Fecha y Hora de Inicio",
        type: "datetime",
        required: true,
      },
      {
        name: "end_timestamp",
        label: "Fecha y Hora de Fin",
        type: "datetime",
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
      { key: "team_name", label: "Equipo", type: "text" },
      { key: "profile_username", label: "Usuario", type: "text" },
      { key: "nickname", label: "Apodo", type: "text" },
      { key: "position", label: "Posición", type: "badge" },
      { key: "birthday", label: "Fecha de Nacimiento", type: "date" },
      { key: "jersey_number", label: "Número de Camiseta", type: "number" },
    ],
    actions: [
      { type: "create", label: "Crear Jugador", variant: "primary" },
      { type: "edit", label: "Editar", variant: "secondary" },
      { type: "delete", label: "Eliminar", variant: "danger" },
    ],
    fields: [
      {
        name: "profile_id",
        label: "Perfil",
        type: "select",
        required: true,
        dataSource: "profiles",
      },
      {
        name: "team_id",
        label: "Equipo",
        type: "select",
        required: false,
        dataSource: "teams",
      },
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
        name: "birthday",
        label: "Fecha de Nacimiento",
        type: "date",
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
      {
        name: "jersey_number",
        label: "Número de Camiseta",
        type: "number",
        placeholder: "10",
        required: false,
      },
    ],
  },
  matches: {
    title: "Partido",
    description: "Gestionar partidos programados",
    displayField: "timestamp",
    displayColumns: [
      { key: "timestamp", label: "Fecha y Hora", type: "datetime" },
      { key: "local_team_name", label: "Local", type: "text" },
      { key: "visitor_team_name", label: "Visitante", type: "text" },
      { key: "competition_name", label: "Competición", type: "text" },
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
        name: "local_team_id",
        label: "Equipo Local",
        type: "select",
        required: true,
        dataSource: "teams",
      },
      {
        name: "visitor_team_id",
        label: "Equipo Visitante",
        type: "select",
        required: true,
        dataSource: "teams",
      },
      {
        name: "competition_id",
        label: "Competición",
        type: "select",
        required: true,
        dataSource: "competitions",
      },
      {
        name: "timestamp",
        label: "Fecha y Hora del Partido",
        type: "datetime",
        required: true,
      },
      {
        name: "location",
        label: "Ubicación",
        type: "text",
        placeholder: "Cancha UC",
        required: false,
      },
      {
        name: "status",
        label: "Estado",
        type: "select",
        required: true,
        options: [
          { value: "scheduled", label: "Programado" },
          { value: "live", label: "En Vivo" },
          { value: "finished", label: "Terminado" },
          { value: "cancelled", label: "Cancelado" },
          { value: "in_review", label: "En Revisión" },
        ],
      },
    ],
  },
  streams: {
    title: "Stream",
    description: "Gestionar transmisiones de YouTube por fecha (una por día)",
    displayField: "title",
    displayColumns: [
      { key: "stream_date", label: "Fecha", type: "date" },
      { key: "title", label: "Título", type: "text" },
      { key: "youtube_video_id", label: "Video ID", type: "text" },
      { key: "is_live_stream", label: "Es Live", type: "boolean" },
      { key: "is_featured", label: "Destacado", type: "boolean" },
      { key: "start_time", label: "Inicio", type: "date" },
    ],
    actions: [
      { type: "create", label: "Crear Stream", variant: "primary" },
      { type: "edit", label: "Editar", variant: "secondary" },
      { type: "delete", label: "Eliminar", variant: "danger" },
    ],
    fields: [
      {
        name: "stream_date",
        label: "Fecha de Transmisión",
        type: "date",
        required: true,
      },
      {
        name: "title",
        label: "Título",
        type: "text",
        placeholder: "Título de la transmisión",
        required: true,
      },
      {
        name: "youtube_url",
        label: "URL de YouTube",
        type: "text",
        placeholder: "https://youtube.com/watch?v=...",
        helpText: "Acepta formatos watch?v=, youtu.be/, embed/, shorts/ y live/",
        required: true,
      },
      {
        name: "is_live_stream",
        label: "Es transmisión en vivo",
        type: "select",
        required: true,
        options: [
          { value: "true", label: "Sí" },
          { value: "false", label: "No" },
        ],
      },
      {
        name: "is_featured",
        label: "Destacado",
        type: "select",
        required: true,
        options: [
          { value: "true", label: "Sí" },
          { value: "false", label: "No" },
        ],
      },
      {
        name: "start_time",
        label: "Hora de Inicio",
        type: "datetime",
        required: false,
      },
      {
        name: "end_time",
        label: "Hora de Fin",
        type: "datetime",
        required: false,
      },
      {
        name: "notes",
        label: "Notas",
        type: "textarea",
        placeholder: "Información adicional...",
        required: false,
      },
    ],
    dynamicHelp: "Ingresa una URL válida de YouTube. El sistema extraerá automáticamente el ID del video y los metadatos.",
  },
  notifications: {
    title: "Notificación",
    description: "Gestionar notificaciones de usuarios",
    displayField: "profile_id",
    displayColumns: [
      { key: "profile_username", label: "Usuario", type: "text" },
      { key: "match_description", label: "Partido", type: "text" },
      { key: "status", label: "Estado", type: "badge" },
      { key: "sent_at", label: "Enviado", type: "date" },
      { key: "is_enabled", label: "Activo", type: "text" },
    ],
    actions: [
      { type: "create", label: "Crear Notificación", variant: "primary" },
      { type: "edit", label: "Editar", variant: "secondary" },
      { type: "delete", label: "Eliminar", variant: "danger" },
    ],
    fields: [
      {
        name: "profile_id",
        label: "Perfil",
        type: "select",
        required: true,
        dataSource: "profiles",
      },
      {
        name: "match_id",
        label: "Partido",
        type: "select",
        required: false,
        dataSource: "matches",
      },
      {
        name: "preference_id",
        label: "Preferencia",
        type: "select",
        required: false,
        dataSource: "preferences",
      },
      {
        name: "status",
        label: "Estado",
        type: "select",
        required: true,
        options: [
          { value: "pending", label: "Pendiente" },
          { value: "sent", label: "Enviado" },
          { value: "failed", label: "Fallido" },
        ],
      },
      {
        name: "is_enabled",
        label: "Activo",
        type: "select",
        required: true,
        options: [
          { value: "true", label: "Sí" },
          { value: "false", label: "No" },
        ],
      },
    ],
  },
  preferences: {
    title: "Preferencia",
    description: "Gestionar preferencias de usuarios",
    displayField: "type",
    displayColumns: [
      { key: "profile_username", label: "Usuario", type: "text" },
      { key: "type", label: "Tipo", type: "badge" },
      { key: "channel", label: "Canal", type: "text" },
      { key: "lead_time_minutes", label: "Tiempo (min)", type: "text" },
      { key: "is_enabled", label: "Activo", type: "text" },
    ],
    actions: [
      { type: "create", label: "Crear Preferencia", variant: "primary" },
      { type: "edit", label: "Editar", variant: "secondary" },
      { type: "delete", label: "Eliminar", variant: "danger" },
    ],
    fields: [
      {
        name: "profile_id",
        label: "Perfil",
        type: "select",
        dataSource: "profiles",
        required: true,
      },
      {
        name: "type",
        label: "Tipo",
        type: "select",
        required: true,
        options: [
          { value: "notification", label: "Notificación" },
          { value: "privacy", label: "Privacidad" },
          { value: "display", label: "Visualización" },
        ],
      },
      {
        name: "channel",
        label: "Canal",
        type: "text",
        placeholder: "email",
        required: true,
      },
      {
        name: "lead_time_minutes",
        label: "Tiempo de Anticipación (minutos)",
        type: "number",
        placeholder: "15",
        required: true,
      },
      {
        name: "is_enabled",
        label: "Activo",
        type: "select",
        required: true,
        options: [
          { value: "true", label: "Sí" },
          { value: "false", label: "No" },
        ],
      },
    ],
  },
  "join-requests": {
    title: "Solicitud de Unión",
    description: "Gestionar solicitudes de unión a equipos",
    displayField: "first_name",
    displayColumns: [
      { key: "first_name", label: "Nombre", type: "text" },
      { key: "last_name", label: "Apellido", type: "text" },
      { key: "team_name", label: "Equipo", type: "text" },
      { key: "nickname", label: "Apodo", type: "text" },
      { key: "profile_username", label: "Usuario", type: "text" },
      { key: "preferred_position", label: "Posición", type: "badge" },
      { key: "status", label: "Estado", type: "badge" },
    ],
    actions: [
      { type: "create", label: "Crear Solicitud", variant: "primary" },
      { type: "edit", label: "Editar", variant: "secondary" },
      { type: "delete", label: "Eliminar", variant: "danger" },
    ],
    fields: [
      {
        name: "team_id",
        label: "Equipo",
        type: "select",
        required: true,
        dataSource: "teams",
      },
      {
        name: "profile_id",
        label: "Perfil",
        type: "select",
        required: true,
        dataSource: "profiles",
      },
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
        name: "birthday",
        label: "Fecha de Nacimiento",
        type: "date",
        required: true,
      },
      {
        name: "preferred_position",
        label: "Posición Preferida",
        type: "select",
        required: true,
        options: [
          { value: "GK", label: "Portero (GK)" },
          { value: "DEF", label: "Defensa (DEF)" },
          { value: "MID", label: "Mediocampo (MID)" },
          { value: "FWD", label: "Delantero (FWD)" },
        ],
      },
      {
        name: "preferred_jersey_number",
        label: "Número de Camiseta",
        type: "number",
        placeholder: "10",
        required: false,
      },
      {
        name: "status",
        label: "Estado",
        type: "select",
        required: true,
        options: [
          { value: "pending", label: "Pendiente" },
          { value: "approved", label: "Aprobado" },
          { value: "rejected", label: "Rechazado" },
        ],
      },
      {
        name: "notes",
        label: "Notas",
        type: "textarea",
        placeholder: "Información adicional...",
        required: false,
      },
    ],
  },
  lineups: {
    title: "Alineación",
    description: "Gestionar alineaciones de partidos",
    displayField: "timestamp",
    displayColumns: [
      { key: "team_name", label: "Equipo", type: "text" },
      { key: "match_description", label: "Partido", type: "text" },
      { key: "timestamp", label: "Fecha y Hora", type: "date" },
      { key: "matrix", label: "Formación", type: "text" },
    ],
    actions: [
      { type: "create", label: "Crear Alineación", variant: "primary" },
      { type: "edit", label: "Editar", variant: "secondary" },
      { type: "delete", label: "Eliminar", variant: "danger" },
    ],
    fields: [
      {
        name: "team_id",
        label: "Equipo",
        type: "select",
        required: true,
        dataSource: "teams",
      },
      {
        name: "match_id",
        label: "Partido",
        type: "select",
        required: true,
        dataSource: "matches",
      },
      {
        name: "timestamp",
        label: "Fecha y Hora",
        type: "datetime",
        required: true,
      },
      {
        name: "matrix",
        label: "Formación (JSON)",
        type: "text",
        placeholder: "4-4-2",
        required: false,
      },
    ],
  },
  events: {
    title: "Evento",
    description: "Gestionar eventos de partidos",
    displayField: "type",
    displayColumns: [
      { key: "type", label: "Tipo", type: "badge" },
      { key: "minute", label: "Minuto", type: "text" },
      { key: "match_description", label: "Partido", type: "text" },
      { key: "team_name", label: "Equipo", type: "text" },
      { key: "description", label: "Descripción", type: "text" },
    ],
    actions: [
      { type: "create", label: "Crear Evento", variant: "primary" },
      { type: "edit", label: "Editar", variant: "secondary" },
      { type: "delete", label: "Eliminar", variant: "danger" },
    ],
    fields: [
      {
        name: "match_id",
        label: "Partido",
        type: "select",
        required: true,
        dataSource: "matches",
      },
      {
        name: "team_id",
        label: "Equipo",
        type: "select",
        required: true,
        dataSource: "teams",
      },
      {
        name: "type",
        label: "Tipo de Evento",
        type: "select",
        required: true,
        options: [
          { value: "goal", label: "Gol" },
          { value: "yellow_card", label: "Tarjeta Amarilla" },
          { value: "red_card", label: "Tarjeta Roja" },
          { value: "substitution", label: "Sustitución" },
          { value: "other", label: "Otro" },
        ],
      },
      {
        name: "minute",
        label: "Minuto",
        type: "number",
        placeholder: "45",
        required: true,
      },
      {
        name: "description",
        label: "Descripción",
        type: "text",
        placeholder: "Descripción del evento...",
        required: false,
      },
    ],
  },
};
