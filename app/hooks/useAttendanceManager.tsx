import { updateBulkAttendance } from "@/actions/planilleros";
import { Player } from "@/lib/types";
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface Attendance {
	id: number;
	player_id: number;
	match_id: number;
	status: "present" | "substitute" | "absent";
	jersey_number?: number;
}

export interface PlayerWithPosition extends Player {
	jersey_number?: number;
}

export const useAttendanceManager = (matchId: number, attendance: Attendance[], players: PlayerWithPosition[]) => {
	const [selectedStatusByPlayer, setSelectedStatusByPlayer] = useState<Record<number, "present" | "substitute" | "absent">>({});
	const [localFeedback, setLocalFeedback] = useState<{ success: 0 | 1; message: string } | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	const [state, formAction] = useActionState(updateBulkAttendance, {
		success: 0,
		errors: 0,
		message: "",
	});

	const getCurrentStatus = useCallback((playerId: number): "present" | "substitute" | "absent" | null => {
		const a = attendance.find((x) => x.player_id === playerId);
		return a?.status || null;
	}, [attendance]);

	const getEffectiveStatus = useCallback((playerId: number): "present" | "substitute" | "absent" | null => {
		return selectedStatusByPlayer[playerId] ?? getCurrentStatus(playerId);
	}, [selectedStatusByPlayer, getCurrentStatus]);

	const duplicateNumbers = useMemo(() => {
		const counts = new Map<number, number>();
		for (const a of attendance) {
			if (a.jersey_number) {
				counts.set(a.jersey_number, (counts.get(a.jersey_number) || 0) + 1);
			}
		}
		const dups = new Set<number>();
		for (const [num, count] of counts) {
			if (count > 1) dups.add(num);
		}
		return dups;
	}, [attendance]);

	const handleBulkSubmit = useCallback(async (formData: FormData) => {
		try {
			setIsSubmitting(true);
			setLocalFeedback(null);
			
			let changes = 0;
			for (const player of players) {
				const currentStatus = getCurrentStatus(player.id);
				const submittedStatus = formData.get(`player_${player.id}_status`) as string | null;
				if (submittedStatus && submittedStatus !== currentStatus) {
					changes++;
				}
				const jerseyField = formData.get(`player_${player.id}_jersey`) as string | null;
				const submittedJersey = jerseyField && jerseyField !== "" ? parseInt(jerseyField) : undefined;
				const currentJersey = attendance.find((a) => a.player_id === player.id)?.jersey_number as number | undefined;
				if ((submittedJersey ?? undefined) !== (currentJersey ?? undefined)) {
					changes++;
				}
			}
			
			if (changes === 0) {
				setLocalFeedback({ success: 1, message: "No hay cambios para actualizar" });
				return;
			}
			
      formAction(formData);
		} catch (error) {
			console.error('Error submitting attendance:', error);
			setLocalFeedback({ 
				success: 0, 
				message: "Error al actualizar la asistencia. Por favor, inténtalo de nuevo." 
			});
		} finally {
			setIsSubmitting(false);
		}
	}, [players, getCurrentStatus, attendance, formAction]);

	const handleCancel = useCallback(() => {
		setSelectedStatusByPlayer({});
		formRef.current?.reset();
		setLocalFeedback({ success: 1, message: "Cambios cancelados" });
	}, []);

	const messageToShow = useMemo(() => 
		localFeedback || (state.message ? { success: state.success as 0 | 1, message: state.message } : null),
		[localFeedback, state.message, state.success]
	);

	useEffect(() => {
		if (state.success) {
			setLocalFeedback(null);
		} else if (state.errors > 0 && state.message) {
			setLocalFeedback({ success: 0, message: state.message });
		}
		setIsSubmitting(false);
	}, [state.success, state.errors, state.message]);

	return {
		selectedStatusByPlayer,
		setSelectedStatusByPlayer,
		localFeedback,
		isSubmitting,
		formRef,
		state,
		getCurrentStatus,
		getEffectiveStatus,
		duplicateNumbers,
		handleBulkSubmit,
		handleCancel,
		messageToShow,
	};
};