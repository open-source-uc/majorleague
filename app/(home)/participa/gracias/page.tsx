import { isAuthUser } from "@/app/actions/auth";
import { getParticipation } from "@/app/actions/participation";

export default async function GraciasPage() {
  const user = await isAuthUser();
  if (user) {
    const participation = await getParticipation(user.id);
    return (
      <div className="flex flex-col items-center justify-center py-10 lg:gap-10">
        <h1 className="text-2xl font-semibold">Gracias por participar</h1>
        <p>Tu solicitud ha sido enviada correctamente, pronto nos pondremos en contacto contigo. </p>
        <div className="flex flex-col gap-2">
          <p>Estado: {participation?.status}</p>
          <p>Equipo: {participation?.team_id}</p>
          <p>Notas: {participation?.notes}</p>
          <p>Fecha de nacimiento: {participation?.birthdate}</p>
          <p>Generación: {participation?.gen}</p>
          <p>Posición: {participation?.preferred_position}</p>
          <p>Major: {participation?.major}</p>
          <p>Equipo: {participation?.team_id}</p>
        </div>
      </div>
    );
  }
}
