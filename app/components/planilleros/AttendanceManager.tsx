"use client";

import { useActionState, useState, useEffect, useMemo, useRef } from "react";

import { updateBulkAttendance } from "@/actions/planilleros";

const getStatusStyles = (status: string | null) => {
	const styles = {
		present: {
			container: "border-primary bg-primary/5",
			indicator: "bg-primary",
			text: "text-primary",
			button: "border-primary bg-primary/10",
		},
		substitute: {
			container: "border-border-header bg-background-header",
			indicator: "bg-foreground/60",
			text: "text-foreground",
			button: "border-border-header bg-background-header",
		},
		absent: {
			container: "border-border-header bg-background opacity-60",
			indicator: "bg-foreground/30",
			text: "text-foreground",
			button: "border-border-header bg-background",
		},
		null: {
			container: "border-border-header bg-background",
			indicator: "bg-foreground/40",
			text: "text-foreground",
			button: "border-border-header hover:border-primary hover:bg-primary/5",
		},
	};
	return styles[status as keyof typeof styles] || styles.null;
};

interface AttendanceManagerProps {
	matchId: number;
	attendance: any[];
	players: any[];
}

export function AttendanceManager({ matchId, attendance, players }: AttendanceManagerProps) {
	const hasUnregisteredPlayers = players.some((player) => !attendance.find((a) => a.player_id === player.id));
	const [isPanelOpen, setIsPanelOpen] = useState(hasUnregisteredPlayers);
	const [filter, setFilter] = useState<"all" | "present" | "substitute" | "absent" | "pending">("all");
	const [selectedStatusByPlayer, setSelectedStatusByPlayer] = useState<Record<number, "present" | "substitute" | "absent">>({});
	const [localFeedback, setLocalFeedback] = useState<{ success: 0 | 1; message: string } | null>(null);
	const rootRef = useRef<HTMLDivElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const [panelMaxHeight, setPanelMaxHeight] = useState<string>("0px");
	const [panelOpacity, setPanelOpacity] = useState<number>(0);
	const listRef = useRef<HTMLDivElement>(null);
	const [itemHeight, setItemHeight] = useState<number>(0);

	const getCurrentStatus = (playerId: number): "present" | "substitute" | "absent" | null => {
		const a = attendance.find((x) => x.player_id === playerId);
		return (a?.status as any) || null;
	};

	const getEffectiveStatus = (playerId: number): "present" | "substitute" | "absent" | null => {
		return selectedStatusByPlayer[playerId] ?? getCurrentStatus(playerId);
	};

	const filteredPlayers = useMemo(() => {
		if (filter === "all") return players;
		if (filter === "pending") return players.filter((p) => getCurrentStatus(p.id) === null);
		return players.filter((player) => getEffectiveStatus(player.id) === filter);
	}, [players, filter, selectedStatusByPlayer, attendance]);

	const [state, formAction] = useActionState(updateBulkAttendance, {
		success: 0,
		errors: 0,
		message: "",
	});

	useEffect(() => {
		if (state.success) {
			setIsPanelOpen(false);
			if (rootRef.current) {
				rootRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
			}
			setLocalFeedback(null);
		}
	}, [state.success]);

	useEffect(() => {
		const el = panelRef.current;
		if (!el) return;
		if (isPanelOpen) {
			const next = el.scrollHeight;
			setPanelMaxHeight(`${next}px`);
			requestAnimationFrame(() => setPanelOpacity(1));
		} else {
			setPanelMaxHeight("0px");
			setPanelOpacity(0);
		}
	}, [isPanelOpen, filteredPlayers.length]);

	const firstItemRef = (node: HTMLDivElement | null) => {
		if (node) {
			const h = node.offsetHeight;
			if (h && h !== itemHeight) setItemHeight(h);
		}
	};

	const listMaxHeight = useMemo(() => {
		if (!itemHeight) return undefined;
		const gap = 12;
		const count = Math.min(filteredPlayers.length, 1);
		return `${60 + itemHeight * count + gap * Math.max(count - 1, 0)}px`;
	}, [itemHeight, filteredPlayers.length]);

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

	const handleBulkSubmit = (formData: FormData) => {
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
		setLocalFeedback(null);
		formAction(formData);
	};

	const handleCancel = () => {
		setSelectedStatusByPlayer({});
		formRef.current?.reset();
		setLocalFeedback({ success: 1, message: "Cambios cancelados" });
	};

	const messageToShow = localFeedback || (state.message ? { success: state.success as 0 | 1, message: state.message } : null);

	return (
		<div ref={rootRef} className="space-y-4 min-w-0">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<span className="text-2xl">📝</span>
					<h3 className="text-foreground text-lg font-semibold">Asistencia</h3>
				</div>
				<button
					type="button"
					onClick={() => setIsPanelOpen(!isPanelOpen)}
					className="text-foreground hover:bg-background-header flex items-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors border border-border-header min-h-[44px] min-w-[44px]"
				>
					<span className={`transform transition-transform duration-200 ${isPanelOpen ? "rotate-180" : ""}`}>▼</span>
					<span className="hidden sm:inline">{isPanelOpen ? "Contraer" : "Expandir"}</span>
				</button>
			</div>

			{messageToShow ? (
				<div role="status" aria-live="polite" className={`rounded-lg border p-4 ${messageToShow.success ? "border-primary bg-primary/5 text-foreground" : "border-border-header bg-background text-foreground"}`}>
					<div className="flex items-center gap-3">
						<span className="text-xl">{messageToShow.success ? "✅" : "❌"}</span>
						<span className="font-medium">{messageToShow.message}</span>
					</div>
				</div>
			) : null}

					<div
			ref={panelRef}
			style={{ maxHeight: panelMaxHeight, opacity: panelOpacity }}
			className="transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden w-full"
		>
				{isPanelOpen && (
					<form action={handleBulkSubmit} ref={formRef} className="space-y-3">
						<input type="hidden" name="match_id" value={matchId} />

						<div className="flex gap-2 pb-3 overflow-x-auto flex-nowrap">
							{[
								{ key: "all", label: "Todos", icon: "👥" },
								{ key: "present", label: "Presentes", icon: "✅" },
								{ key: "substitute", label: "Suplentes", icon: "🔄" },
								{ key: "absent", label: "Ausentes", icon: "❌" },
								{ key: "pending", label: "Pendientes", icon: "⏳" },
							].map(({ key, label, icon }) => (
								<button
									key={key}
									type="button"
									onClick={() => setFilter(key as any)}
									className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-2 min-h-[44px] ${
										filter === key ? "border-primary bg-primary/5 text-primary" : "border-border-header bg-background text-foreground"
									}`}
								>
									<span className="text-base">{icon}</span>
									<span>{label}</span>
								</button>
							))}
						</div>

						<div
							ref={listRef}
							className="grid gap-3 overflow-y-auto pr-2"
							style={{ maxHeight: listMaxHeight }}
						>
							{filteredPlayers.map((player, idx) => {
								const playerAttendance = attendance.find((a) => a.player_id === player.id);
								const currentStatus = playerAttendance?.status || null;
								const effectiveStatus = getEffectiveStatus(player.id);
								const statusStyles = getStatusStyles(effectiveStatus);
								const isDuplicate = !!(playerAttendance?.jersey_number && duplicateNumbers.has(playerAttendance.jersey_number));
								const isDirty = effectiveStatus !== currentStatus && effectiveStatus !== null;

								return (
									<div
										key={player.id}
										ref={idx === 0 ? firstItemRef : undefined}
										className={`relative rounded-lg border-2 p-4 transition-all ${statusStyles.container}`}
									>
										{isDirty && (
											<span className="absolute right-2 top-2 rounded-full border border-border-header bg-background-header px-2 py-0.5 text-[10px] font-medium text-foreground/90">No guardado</span>
										)}
										<div className="mb-4 space-y-3">
											<div className="flex items-center gap-3">
												<div className={`h-5 w-5 rounded-full ${statusStyles.indicator} flex-shrink-0`} />
												<div className="min-w-0 flex-1">
													<div className={`font-medium ${statusStyles.text} text-base sm:text-base`}>
														{player.first_name} {player.last_name}
														{player.nickname && <span className={`ml-2 text-sm ${statusStyles.text} opacity-80`}>&quot;{player.nickname}&quot;</span>}
													</div>
													<div className={`flex items-center gap-2 text-sm ${statusStyles.text} mt-1`}>
														<span className="bg-background-header px-2 py-1 rounded text-xs font-medium">{player.position}</span>
														{effectiveStatus === "present" && playerAttendance?.jersey_number && (
															<span className="bg-primary text-white rounded px-2 py-1 text-xs font-medium">#{playerAttendance.jersey_number}</span>
														)}
													</div>
												</div>
											</div>
											
											<div className="flex items-center gap-3">
												<label className={`text-sm font-medium ${statusStyles.text} whitespace-nowrap`}>Número:</label>
												<input
													type="number"
													inputMode="numeric"
													enterKeyHint="done"
													name={`player_${player.id}_jersey`}
													min="1"
													max="99"
													defaultValue={playerAttendance?.jersey_number || ""}
													className={`bg-background border text-foreground w-20 sm:w-16 rounded-lg px-3 py-3 text-center font-semibold focus:border-primary focus:ring-1 focus:ring-primary ${isDuplicate ? "border-primary" : "border-border-header"}`}
													placeholder={player.jersey_number ? `#${player.jersey_number}` : "##"}
												/>
											</div>
										</div>

										<div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
											{[
												{ value: "present", label: "Presente", shortLabel: "✅", fullLabel: "✅ Presente" },
												{ value: "substitute", label: "Suplente", shortLabel: "🔄", fullLabel: "🔄 Suplente" },
												{ value: "absent", label: "Ausente", shortLabel: "❌", fullLabel: "❌ Ausente" },
											].map(({ value, label, shortLabel, fullLabel }) => {
												const isSelected = effectiveStatus === value;
												const buttonStyles = getStatusStyles(isSelected ? value : null);

												return (
													<label
														key={value}
														className={`flex cursor-pointer items-center justify-center gap-2 sm:gap-3 rounded-lg border-2 p-3 sm:p-4 transition-all min-h-[52px] sm:min-h-[48px] ${
														isSelected ? buttonStyles.button : "border-border-header hover:border-primary hover:bg-primary/5"
													}`}
													>
													<input
														type="radio"
														name={`player_${player.id}_status`}
														value={value}
														checked={isSelected}
														onChange={() => setSelectedStatusByPlayer((prev) => ({ ...prev, [player.id]: value as any }))}
														className="sr-only"
													/>
													<span className="text-lg sm:text-lg flex-shrink-0">{shortLabel}</span>
													<span className={`font-medium ${isSelected ? statusStyles.text : "text-foreground"} text-base sm:text-base text-center min-w-0`}>
														<span className="sm:hidden">{label}</span>
														<span className="hidden sm:inline">{label}</span>
													</span>
												</label>
											);
										})}
									</div>
								</div>
							);
						})}
						</div>

						<div className="border-border-header border-t pt-6 ">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<button type="button" onClick={handleCancel} className="bg-foreground hover:bg-foreground/80 text-background rounded-xl px-6 py-4 text-base sm:text-sm font-semibold transition-colors shadow-sm min-h-[56px] order-1 sm:order-2 w-full">
									Cancelar cambios
								</button>
								<button type="submit" className="bg-primary hover:bg-primary-darken text-background rounded-xl px-6 py-4 text-base sm:text-sm font-semibold transition-colors shadow-sm min-h-[56px] order-1 sm:order-2 w-full">
									Actualizar Asistencia
								</button>
							</div>
						</div>
					</form>
				)}
			</div>

			{!isPanelOpen && (
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-2 lg:grid-cols-4 sm:items-center sm:justify-center sm:gap-6 py-4">
						<div className="text-center">
							<div className="flex items-center justify-center gap-2 mb-2">
								<div className="h-4 w-4 rounded-full bg-primary flex-shrink-0"></div>
								<span className="text-sm font-medium text-primary">Presentes</span>
							</div>
							<span className="text-2xl font-bold text-primary">{attendance.filter((a) => a.status === "present").length}</span>
						</div>
						<div className="text-center">
							<div className="flex items-center justify-center gap-2 mb-2">
								<div className="h-4 w-4 rounded-full bg-foreground/60 flex-shrink-0"></div>
								<span className="text-sm font-medium text-foreground">Suplentes</span>
							</div>
							<span className="text-2xl font-bold text-foreground">{attendance.filter((a) => a.status === "substitute").length}</span>
						</div>
						<div className="text-center">
							<div className="flex items-center justify-center gap-2 mb-2">
								<div className="h-4 w-4 rounded-full bg-foreground/30 flex-shrink-0"></div>
								<span className="text-sm font-medium text-foreground">Ausentes</span>
							</div>
							<span className="text-2xl font-bold text-foreground">{attendance.filter((a) => a.status === "absent").length}</span>
						</div>
						<div className="text-center">
							<div className="flex items-center justify-center gap-2 mb-2">
								<div className="h-4 w-4 rounded-full bg-foreground/40 flex-shrink-0"></div>
								<span className="text-sm font-medium text-foreground">Pendientes</span>
							</div>
							<span className="text-2xl font-bold text-foreground">{players.length - attendance.length}</span>
						</div>
					</div>
					<div className="text-center text-sm text-foreground/90 px-4">
						<p>Toca "Expandir" para gestionar la asistencia de los jugadores</p>
					</div>
				</div>
			)}
		</div>
	);
}
