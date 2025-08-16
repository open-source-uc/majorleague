"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Attendance, PlayerWithPosition, useAttendanceManager } from "@/hooks/useAttendanceManager";

const ATTENDANCE_STATUS_OPTIONS = [
	{ value: "present" as const, label: "Presente", shortLabel: "✅", fullLabel: "✅ Presente" },
	{ value: "substitute" as const, label: "Suplente", shortLabel: "🔄", fullLabel: "🔄 Suplente" },
	{ value: "absent" as const, label: "Ausente", shortLabel: "❌", fullLabel: "❌ Ausente" },
] as const;

const FILTER_OPTIONS = [
	{ key: "all" as const, label: "Todos", icon: "👥" },
	{ key: "present" as const, label: "Presentes", icon: "✅" },
	{ key: "substitute" as const, label: "Suplentes", icon: "🔄" },
	{ key: "absent" as const, label: "Ausentes", icon: "❌" },
	{ key: "pending" as const, label: "Pendientes", icon: "⏳" },
] as const;

const STATUS_STYLES = {
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
} as const;

const getStatusStyles = (status: string | null) => {
	return STATUS_STYLES[status as keyof typeof STATUS_STYLES] || STATUS_STYLES.null;
};


interface AttendanceManagerProps {
	matchId: number;
	attendance: Attendance[];
	players: PlayerWithPosition[];
}

export function AttendanceManager({ matchId, attendance, players }: AttendanceManagerProps) {
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [filter, setFilter] = useState<"all" | "present" | "substitute" | "absent" | "pending">("all");
	const rootRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const [panelMaxHeight, setPanelMaxHeight] = useState<string>("0px");
	const [panelOpacity, setPanelOpacity] = useState<number>(0);
	const listRef = useRef<HTMLDivElement>(null);
	const [itemHeight, setItemHeight] = useState<number>(0);

	const {
		selectedStatusByPlayer,
		setSelectedStatusByPlayer,
		isSubmitting,
		formRef,
		getCurrentStatus,
		getEffectiveStatus,
		duplicateNumbers,
		handleBulkSubmit,
		handleCancel,
		messageToShow,
		state,
	} = useAttendanceManager(matchId, attendance, players);

	const filteredPlayers = useMemo(() => {
		if (filter === "all") return players;
		if (filter === "pending") return players.filter((p) => getCurrentStatus(p.id) === null);
		return players.filter((player) => getEffectiveStatus(player.id) === filter);
	}, [players, filter, getCurrentStatus, getEffectiveStatus]);

	useEffect(() => {
		if (state.success) {
			setIsPanelOpen(false);
			if (rootRef.current) {
				rootRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
			}
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
		const count = Math.min(filteredPlayers.length, 2);
		return `${60 + itemHeight * count + gap * Math.max(count - 1, 0)}px`;
	}, [itemHeight, filteredPlayers.length]);

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
					aria-expanded={isPanelOpen}
					aria-controls="attendance-panel"
					aria-label={`${isPanelOpen ? "Contraer" : "Expandir"} panel de asistencia`}
				>
					<span className={`transform transition-transform duration-200 ${isPanelOpen ? "rotate-180" : ""}`} aria-hidden="true">▼</span>
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
			id="attendance-panel"
			ref={panelRef}
			style={{ maxHeight: panelMaxHeight, opacity: panelOpacity }}
			className="transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden w-full"
		>
				{isPanelOpen && (
					<form action={handleBulkSubmit} ref={formRef} className="space-y-3">
						<input type="hidden" name="match_id" value={matchId} />

						<fieldset className="flex gap-2 pb-3 overflow-x-auto flex-nowrap">
							<legend className="sr-only">Filtrar jugadores por estado de asistencia</legend>
							{FILTER_OPTIONS.map(({ key, label, icon }) => (
								<button
									key={key}
									type="button"
									onClick={() => setFilter(key as typeof filter)}
									className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-2 min-h-[44px] ${
										filter === key ? "border-primary bg-primary/5 text-primary" : "border-border-header bg-background text-foreground"
									}`}
									aria-pressed={filter === key}
								>
									<span className="text-base" aria-hidden="true">{icon}</span>
									<span>{label}</span>
								</button>
							))}
						</fieldset>

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
												<label htmlFor={`player_${player.id}_jersey`} className={`text-sm font-medium ${statusStyles.text} whitespace-nowrap`}>Número:</label>
												<input
													id={`player_${player.id}_jersey`}
													type="number"
													inputMode="numeric"
													enterKeyHint="done"
													name={`player_${player.id}_jersey`}
													min="1"
													max="99"
													defaultValue={playerAttendance?.jersey_number || ""}
													className={`bg-background border text-foreground w-20 sm:w-16 rounded-lg px-3 py-3 text-center font-semibold focus:border-primary focus:ring-1 focus:ring-primary ${isDuplicate ? "border-primary" : "border-border-header"}`}
													placeholder={player.jersey_number ? `#${player.jersey_number}` : "##"}
													aria-describedby={isDuplicate ? `duplicate-warning-${player.id}` : undefined}
												/>
												{isDuplicate && (
													<span id={`duplicate-warning-${player.id}`} className="text-xs text-primary" role="alert">
														Número duplicado
													</span>
												)}
											</div>
										</div>

										<fieldset className="grid grid-cols-1 lg:grid-cols-3 gap-3">
											<legend className="sr-only">Estado de asistencia para {player.first_name} {player.last_name}</legend>
											{ATTENDANCE_STATUS_OPTIONS.map(({ value, label, shortLabel, fullLabel }) => {
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
														onChange={() => setSelectedStatusByPlayer((prev) => ({ ...prev, [player.id]: value as "present" | "substitute" | "absent" }))}
														className="sr-only"
														aria-describedby={`status-description-${player.id}-${value}`}
													/>
													<span className="text-lg sm:text-lg flex-shrink-0" aria-hidden="true">{shortLabel}</span>
													<span 
														id={`status-description-${player.id}-${value}`}
														className={`font-medium ${isSelected ? statusStyles.text : "text-foreground"} text-base sm:text-base text-center min-w-0`}
													>
														<span className="sm:hidden">{label}</span>
														<span className="hidden sm:inline">{label}</span>
													</span>
												</label>
											);
										})}
									</fieldset>
								</div>
							);
						})}
						</div>

						<div className="border-border-header border-t pt-6 ">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<button type="button" onClick={handleCancel} className="bg-foreground hover:bg-foreground/80 text-background rounded-xl px-6 py-4 text-base sm:text-sm font-semibold transition-colors shadow-sm min-h-[56px] order-1 sm:order-2 w-full">
									Cancelar cambios
								</button>
								<button 
									type="submit" 
									disabled={isSubmitting}
									className="bg-primary hover:bg-primary-darken disabled:bg-primary/50 disabled:cursor-not-allowed text-background rounded-xl px-6 py-4 text-base sm:text-sm font-semibold transition-colors shadow-sm min-h-[56px] order-1 sm:order-2 w-full flex items-center justify-center gap-2"
								>
									{isSubmitting ? (
										<>
											<span className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
											Actualizando...
										</>
									) : (
										"Actualizar Asistencia"
									)}
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
