export interface DeviceInfo {
  readonly index: number
  readonly mac: string
  readonly name: string
  readonly type: string
  readonly comPort?: string
  readonly capabilities: readonly string[]
}

/** Maps GATT service names (from device_type) to capability ids */
const gattServiceToCapability: Record<string, string> = {
  "Heart Rate": "ecg",
  "Blood Pressure": "blood_pressure",
}

function deriveCapabilities(deviceType: string, comPort?: string): readonly string[] {
  const caps: string[] = []
  if (comPort) caps.push("eeg")
  for (const service of deviceType.split("+")) {
    const cap = gattServiceToCapability[service]
    if (cap !== undefined && !caps.includes(cap)) caps.push(cap)
  }
  return caps
}

export type BodyMonitorState = "idle" | "starting" | "running" | "stopping"
export const REPLAY_SPEED_OPTIONS = [1, 2, 4, 10] as const
export type ReplaySpeed = (typeof REPLAY_SPEED_OPTIONS)[number]

export interface BodyMonitorStdioConfigureRequest {
  readonly type: "bodymonitor_stdio_configure"
  readonly params: readonly string[]
}

export interface BodyMonitorStdioStartRequest {
  readonly type: "bodymonitor_stdio_start"
}

export interface BodyMonitorStdioStopRequest {
  readonly type: "bodymonitor_stdio_stop"
}

export interface BodyMonitorStdioSetParamRequest {
  readonly type: "bodymonitor_stdio_setparam"
  readonly key: string
  readonly value: string
}

export interface BodyMonitorStdioQuitRequest {
  readonly type: "bodymonitor_stdio_quit"
}

export interface BodyMonitorServerListDevicesRequest {
  readonly type: "bodymonitor_server_list_devices"
}

export interface BodyMonitorServerPingDeviceRequest {
  readonly type: "bodymonitor_server_ping_device"
  readonly mac: string
}

export interface BodyMonitorServerDiagnoseEegRequest {
  readonly type: "bodymonitor_server_diagnose_eeg"
  readonly mac: string
}

export interface BodyMonitorAlphaRelaxationStartRequest {
  readonly type: "bodymonitor_request_alpha_relaxation_start"
  readonly durationMin: number
}

export interface BodyMonitorAlphaRelaxationStopRequest {
  readonly type: "bodymonitor_request_alpha_relaxation_stop"
}

export interface BodyMonitorSleepDrowseStartRequest {
  readonly type: "bodymonitor_request_sleep_drowse_start"
  readonly durationMin: number
}

export interface BodyMonitorSleepDrowseStopRequest {
  readonly type: "bodymonitor_request_sleep_drowse_stop"
}

export interface ReplayStartRequest {
  readonly type: "replay_start"
  readonly sessionId: number
  readonly timestampMs?: number
}

export interface ReplayStopRequest {
  readonly type: "replay_stop"
}

export interface ReplayPauseRequest {
  readonly type: "replay_pause"
}

export interface ReplaySeekRequest {
  readonly type: "replay_seek"
  readonly timestampMs: number
}

export interface ReplaySetSpeedRequest {
  readonly type: "replay_set_speed"
  readonly speed: ReplaySpeed
}

export type BodyMonitorBrowserMessage =
  | BodyMonitorServerListDevicesRequest
  | BodyMonitorServerPingDeviceRequest
  | BodyMonitorServerDiagnoseEegRequest
  | BodyMonitorAlphaRelaxationStartRequest
  | BodyMonitorAlphaRelaxationStopRequest
  | BodyMonitorSleepDrowseStartRequest
  | BodyMonitorSleepDrowseStopRequest
  | ReplayStartRequest
  | ReplayStopRequest
  | ReplayPauseRequest
  | ReplaySeekRequest
  | ReplaySetSpeedRequest
  | BodyMonitorStdioConfigureRequest
  | BodyMonitorStdioStartRequest
  | BodyMonitorStdioStopRequest
  | BodyMonitorStdioSetParamRequest
  | BodyMonitorStdioQuitRequest

export type AudioFileKind = "wav" | "flac" | "gnaural"

export type AudioTransportState = "idle" | "loading" | "playing" | "paused" | "stopping"

export type AudioRenderState = "idle" | "rendering" | "ready" | "failed"

export interface AudioSettings {
  readonly presetsRoot: string
}

export interface AudioStartRequest {
  readonly type: "audio_start"
  readonly filePath: string
}

export interface AudioStopRequest {
  readonly type: "audio_stop"
}

export interface AudioPauseRequest {
  readonly type: "audio_pause"
}

export interface AudioResumeRequest {
  readonly type: "audio_resume"
}

export interface AudioSeekRequest {
  readonly type: "audio_seek"
  readonly positionSec: number
}

export interface AudioSetVolumeRequest {
  readonly type: "audio_set_volume"
  readonly left: number
  readonly right: number
}

export interface AudioAlphaRelaxationStartRequest {
  readonly type: "audio_alpha_relaxation_start"
  readonly durationMin: number
}

export interface AudioAlphaRelaxationStopRequest {
  readonly type: "audio_alpha_relaxation_stop"
}

export interface AudioSleepDrowseStartRequest {
  readonly type: "audio_sleep_drowse_start"
  readonly durationMin: number
}

export interface AudioSleepDrowseStopRequest {
  readonly type: "audio_sleep_drowse_stop"
}

export type AudioBrowserMessage =
  | AudioStartRequest
  | AudioStopRequest
  | AudioPauseRequest
  | AudioResumeRequest
  | AudioSeekRequest
  | AudioSetVolumeRequest
  | AudioAlphaRelaxationStartRequest
  | AudioAlphaRelaxationStopRequest
  | AudioSleepDrowseStartRequest
  | AudioSleepDrowseStopRequest

export type BrowserMessage = BodyMonitorBrowserMessage | AudioBrowserMessage

export interface PresetTreeNode {
  readonly name: string
  readonly path: string
  readonly isDir: boolean
  readonly fileKind?: AudioFileKind
  readonly children?: readonly PresetTreeNode[]
}

export interface AudioPresetsResponse {
  readonly presetsRoot: string
  readonly items: readonly PresetTreeNode[]
}

export interface AudioEditorDocumentResponse {
  readonly filePath: string
  readonly content: string
  readonly modifiedAtMs: number
}

export interface AudioEditorSaveRequest {
  readonly path: string
  readonly content: string
  readonly expectedModifiedAtMs: number
}

export interface AudioEditorAutosaveRequest {
  readonly path: string
  readonly content: string
}

export interface AudioEditorSaveResponse {
  readonly filePath: string
  readonly modifiedAtMs: number
  readonly savedAt: string
  readonly changed: boolean
  readonly historyFileName: string | null
}

export interface AudioEditorHistoryEntry {
  readonly fileName: string
  readonly createdAt: string
  readonly modifiedAtMs: number
  readonly size: number
  readonly isAutosave: boolean
}

export interface AudioEditorHistoryResponse {
  readonly filePath: string
  readonly items: readonly AudioEditorHistoryEntry[]
}

export interface AudioEditorHistoryContentResponse {
  readonly filePath: string
  readonly historyFileName: string
  readonly content: string
  readonly modifiedAtMs: number
  readonly isAutosave: boolean
}

export interface AudioEditorRestoreRequest {
  readonly path: string
  readonly historyFileName: string
  readonly expectedModifiedAtMs: number
}

export interface AudioEditorRestoreResponse {
  readonly filePath: string
  readonly modifiedAtMs: number
  readonly restoredAt: string
  readonly restoredFrom: string
  readonly historyFileName: string
}

export interface AudioScheduleVoicePatchRequest {
  readonly path: string
  readonly voiceId: number
  readonly hidden?: boolean
  readonly muted?: boolean
  readonly color?: string
}

export interface AudioScheduleVoicePatchResponse {
  readonly filePath: string
  readonly modifiedAtMs: number
  readonly savedAt: string
  readonly changed: boolean
  readonly historyFileName: string | null
  readonly voiceId: number
  readonly voiceIndex: number
}

export type LogSessionKind = "scan" | "monitor"

export type LogSessionStatus = "active" | "completed" | "failed" | "interrupted"

export interface LogDeviceSummary {
  readonly capability: string
  readonly label: string
}

export interface ArchivedLogSummary {
  readonly id: number
  readonly kind: LogSessionKind
  readonly createdAt: string
  readonly startedAt: string
  readonly endedAt?: string
  readonly defaultName: string
  readonly customName?: string
  readonly effectiveName: string
  readonly isFavorite: boolean
  readonly status: LogSessionStatus
  readonly sourceRunId?: string
  readonly commandLine?: string
  readonly eventCount: number
  readonly exitCode?: number
  readonly deviceSummary: readonly LogDeviceSummary[]
  readonly audioSchedule?: GnauralScheduleData
  readonly audioScheduleStartedAtMs?: number
  readonly tags: readonly string[]
}

export interface ArchivedLogDetail extends ArchivedLogSummary {}

export interface ArchivedLogEventRecord {
  readonly id: number
  readonly sessionId: number
  readonly seqNo: number
  readonly createdAt: string
  readonly eventType: BodyMonitorServerEvent["type"]
  readonly payload: BodyMonitorServerEvent
  readonly rawLine?: string
}

export interface ArchivedLogListResult {
  readonly items: readonly ArchivedLogSummary[]
  readonly page: number
  readonly pageSize: number
  readonly total: number
}

export interface LogSettings {
  readonly retentionDays: number
}

export type LogChartPanel = "ecg" | "breath" | "eeg"

export type LogChartRenderMode = "line" | "scatter" | "step"

export const EEG_SNAPSHOT_SERIES_KEYS = [
  "raw",
  "poorSignal",
  "attention",
  "meditation",
  "delta",
  "theta",
  "alpha1",
  "alpha2",
  "beta1",
  "beta2",
  "gamma1",
  "gamma2",
] as const

export const LOG_CHART_SERIES_ORDER = [
  "hr",
  "rr",
  "breath_phase",
  ...EEG_SNAPSHOT_SERIES_KEYS,
] as const

export type EegSnapshotSeriesKey = (typeof EEG_SNAPSHOT_SERIES_KEYS)[number]

export type LogChartSeriesKey = (typeof LOG_CHART_SERIES_ORDER)[number]

export type LogChartPoint = readonly [timestampMs: number, value: number]

export interface LogChartSeriesMeta {
  readonly panel: LogChartPanel
  readonly unit?: string
  readonly renderMode: LogChartRenderMode
  readonly defaultVisible: boolean
}

export interface LogChartSeries extends LogChartSeriesMeta {
  readonly key: LogChartSeriesKey
  readonly points: readonly LogChartPoint[]
}

export interface LogChartDataSnapshot {
  readonly series: readonly LogChartSeries[]
  readonly minTimestampMs: number | null
  readonly maxTimestampMs: number | null
}

export interface ArchivedLogChartData extends LogChartDataSnapshot {
  readonly sessionId: number
  readonly sessionName: string
}

export const LOG_CHART_SERIES_META: Record<LogChartSeriesKey, LogChartSeriesMeta> = {
  hr: {
    panel: "ecg",
    unit: "bpm",
    renderMode: "line",
    defaultVisible: true,
  },
  rr: {
    panel: "ecg",
    unit: "ms",
    renderMode: "scatter",
    defaultVisible: true,
  },
  breath_phase: {
    panel: "breath",
    renderMode: "step",
    defaultVisible: true,
  },
  raw: {
    panel: "eeg",
    renderMode: "line",
    defaultVisible: false,
  },
  poorSignal: {
    panel: "eeg",
    unit: "%",
    renderMode: "line",
    defaultVisible: true,
  },
  attention: {
    panel: "eeg",
    unit: "%",
    renderMode: "line",
    defaultVisible: true,
  },
  meditation: {
    panel: "eeg",
    unit: "%",
    renderMode: "line",
    defaultVisible: true,
  },
  delta: {
    panel: "eeg",
    renderMode: "line",
    defaultVisible: false,
  },
  theta: {
    panel: "eeg",
    renderMode: "line",
    defaultVisible: false,
  },
  alpha1: {
    panel: "eeg",
    renderMode: "line",
    defaultVisible: false,
  },
  alpha2: {
    panel: "eeg",
    renderMode: "line",
    defaultVisible: false,
  },
  beta1: {
    panel: "eeg",
    renderMode: "line",
    defaultVisible: false,
  },
  beta2: {
    panel: "eeg",
    renderMode: "line",
    defaultVisible: false,
  },
  gamma1: {
    panel: "eeg",
    renderMode: "line",
    defaultVisible: false,
  },
  gamma2: {
    panel: "eeg",
    renderMode: "line",
    defaultVisible: false,
  },
}

export const createEmptyLogChartDataSnapshot = (): LogChartDataSnapshot => {
  return {
    series: LOG_CHART_SERIES_ORDER.map((key) => ({
      key,
      ...LOG_CHART_SERIES_META[key],
      points: [],
    })),
    minTimestampMs: null,
    maxTimestampMs: null,
  }
}

export interface RuntimeHrNotificationEvent {
  readonly event: "hr_notification"
  readonly epoch?: number
  readonly ts?: string
  readonly hr: number
  readonly rr: readonly number[]
}

export interface RuntimeBreathPhaseEvent {
  readonly event: "breath_phase"
  readonly epoch?: number
  readonly ts?: string
  readonly phase: "inhale" | "exhale"
  readonly extremum?: "peak" | "valley"
  readonly hr?: number
  readonly rrRawMs?: number
  readonly rrSmoothMs?: number
  readonly deltaMs?: number
  readonly sampleIndex?: number
}

export interface RuntimeSnapshotEvent {
  readonly event: "snapshot"
  readonly epoch?: number
  readonly ts?: string
  readonly raw?: number
  readonly poorSignal?: number
  readonly attention?: number
  readonly meditation?: number
  readonly delta?: number
  readonly theta?: number
  readonly alpha1?: number
  readonly alpha2?: number
  readonly beta1?: number
  readonly beta2?: number
  readonly gamma1?: number
  readonly gamma2?: number
}

export interface BodyMonitorStatusEvent {
  readonly type: "bodymonitor_status"
  readonly state: BodyMonitorState
  readonly sessionState?: BodyMonitorState
  readonly runId?: string
  readonly commandLine?: string
}

export interface BodyMonitorStartedEvent {
  readonly type: "bodymonitor_started"
  readonly runId: string
  readonly params: readonly string[]
  readonly commandLine: string
}

export interface BodyMonitorScanCommandEvent {
  readonly type: "bodymonitor_scan_command"
  readonly runId: string
  readonly cmd: "list_devices"
  readonly commandLine: string
}

export interface BodyMonitorOutputEvent {
  readonly type: "bodymonitor_output"
  readonly runId: string
  readonly stream: "stdout" | "stderr"
  readonly line: string
  readonly parsedJson?: unknown
}

export interface BodyMonitorDeviceEvent {
  readonly type: "bodymonitor_device"
  readonly runId: string
  readonly device: DeviceInfo
}

export interface BodyMonitorDevicesEvent {
  readonly type: "bodymonitor_devices"
  readonly runId: string
  readonly devices: readonly DeviceInfo[]
}

export interface BodyMonitorPingResultEvent {
  readonly type: "bodymonitor_ping_result"
  readonly mac: string
  readonly ok: boolean
  readonly identifier?: string
  readonly message?: string
  readonly elapsedMs?: number
}

export type BodyMonitorScanDeviceStage =
  | "queued"
  | "probing"
  | "complete"
  | "failed"
  | "not_connectable"
  | "cancelled"

export interface BodyMonitorScanDeviceStatusEvent {
  readonly type: "bodymonitor_scan_device_status"
  readonly runId: string
  readonly mac: string
  readonly stage: BodyMonitorScanDeviceStage
  readonly index: number
  readonly totalCount: number
  readonly completedCount: number
  readonly message?: string
}

export interface BodyMonitorErrorEvent {
  readonly type: "bodymonitor_error"
  readonly message: string
  readonly runId?: string
}

export interface EegDiagnosticsBleInfo {
  readonly ok: boolean
  readonly identifier?: string
  readonly elapsedMs?: number
  readonly message?: string
}

export interface EegDiagnosticsComInfo {
  readonly found: boolean
  readonly port?: string
  readonly description?: string
  readonly pnpDeviceId?: string
}

export interface BodyMonitorEegDiagnosticsEvent {
  readonly type: "bodymonitor_eeg_diagnostics"
  readonly mac: string
  readonly updatedAtMs: number
  readonly ble?: EegDiagnosticsBleInfo
  readonly com?: EegDiagnosticsComInfo
  readonly overallKey: "ok" | "ble_missing" | "com_missing" | "checking" | "error"
  readonly message?: string
  readonly errorCode?: number
  readonly errorStage?: string
}

export interface BodyMonitorExitEvent {
  readonly type: "bodymonitor_exit"
  readonly runId: string
  readonly exitCode: number
}

export interface BodyMonitorStdioAckEvent {
  readonly type: "bodymonitor_stdio_ack"
  readonly cmd: string
  readonly ok: boolean
  readonly error?: string
}

export interface BodyMonitorStdioReadyEvent {
  readonly type: "bodymonitor_stdio_ready"
}

export interface BodyMonitorServerReadyEvent {
  readonly type: "bodymonitor_server_ready"
}

export interface GnauralScheduleEntry {
  readonly startSec: number
  readonly endSec: number
  readonly durationSec: number
  readonly baseFreqStart: number
  readonly baseFreqEnd: number
  readonly beatFreqHalfStart: number
  readonly beatFreqHalfEnd: number
  readonly volLStart: number
  readonly volLEnd: number
  readonly volRStart: number
  readonly volREnd: number
}

export interface GnauralScheduleVoice {
  readonly id: number
  readonly type: string
  readonly typeIndex: number
  readonly description: string
  readonly hidden: boolean
  readonly muted: boolean
  readonly mono: boolean
  readonly color: string | null
  readonly audioFilePath: string
  readonly totalDurationSec: number
  readonly entryCount: number
  readonly entries: readonly GnauralScheduleEntry[]
}

export interface GnauralScheduleData {
  readonly title: string
  readonly author: string
  readonly description: string
  readonly totalTimeSec: number
  readonly loopCount: number
  readonly overallVolL: number
  readonly overallVolR: number
  readonly stereoSwap: boolean
  readonly voiceCount: number
  readonly voices: readonly GnauralScheduleVoice[]
}

export interface AudioStatusEvent {
  readonly type: "audio_status"
  readonly transportState: AudioTransportState
  readonly renderState: AudioRenderState
  readonly filePath?: string
  readonly fileKind?: AudioFileKind
  readonly runId?: string
  readonly renderRunId?: string
  readonly positionSec?: number
  readonly durationSec?: number
}

export interface AudioProgressEvent {
  readonly type: "audio_progress"
  readonly positionSec: number
}

export interface AudioErrorEvent {
  readonly type: "audio_error"
  readonly message: string
  readonly filePath?: string
}

export interface AudioExitEvent {
  readonly type: "audio_exit"
  readonly role: "playback" | "render"
  readonly exitCode: number
  readonly runId?: string
  readonly filePath?: string
}

export interface AudioRenderProgressEvent {
  readonly type: "audio_render_progress"
  readonly filePath: string
}

export interface AudioRenderDoneEvent {
  readonly type: "audio_render_done"
  readonly filePath: string
  readonly tempWavPath: string
}

export interface AudioScheduleLoadedEvent {
  readonly type: "audio_schedule_loaded"
  readonly filePath: string
  readonly schedule: GnauralScheduleData
  readonly loadedAtMs?: number
}

export interface ReplayStartedEvent {
  readonly type: "replay_started"
  readonly sessionId: number
  readonly sessionName: string
  readonly kind: LogSessionKind
  readonly devices: readonly LogDeviceSummary[]
  readonly speed: ReplaySpeed
  readonly startedAtMs?: number
  readonly audioSchedule?: GnauralScheduleData
  readonly audioScheduleStartedAtMs?: number
  readonly cursorTimestampMs?: number
}

export interface ReplayProgressEvent {
  readonly type: "replay_progress"
  readonly sessionId: number
  readonly speed: ReplaySpeed
  readonly cursorTimestampMs?: number
}

export interface ReplayStoppedEvent {
  readonly type: "replay_stopped"
  readonly sessionId: number
}

export interface ReplayPausedEvent {
  readonly type: "replay_paused"
  readonly sessionId: number
  readonly cursorTimestampMs?: number
}

export interface ReplayFinishedEvent {
  readonly type: "replay_finished"
  readonly sessionId: number
}

export type BodyMonitorServerEvent =
  | BodyMonitorStatusEvent
  | BodyMonitorStartedEvent
  | BodyMonitorScanCommandEvent
  | BodyMonitorOutputEvent
  | BodyMonitorDeviceEvent
  | BodyMonitorDevicesEvent
  | BodyMonitorPingResultEvent
  | BodyMonitorScanDeviceStatusEvent
  | BodyMonitorEegDiagnosticsEvent
  | BodyMonitorErrorEvent
  | BodyMonitorExitEvent
  | BodyMonitorStdioAckEvent
  | BodyMonitorStdioReadyEvent
  | BodyMonitorServerReadyEvent
  | ReplayStartedEvent
  | ReplayProgressEvent
  | ReplayStoppedEvent
  | ReplayPausedEvent
  | ReplayFinishedEvent

export type AudioServerEvent =
  | AudioStatusEvent
  | AudioProgressEvent
  | AudioErrorEvent
  | AudioExitEvent
  | AudioRenderProgressEvent
  | AudioRenderDoneEvent
  | AudioScheduleLoadedEvent

export type ServerEvent = BodyMonitorServerEvent | AudioServerEvent

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const isStringArray = (value: unknown): value is readonly string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}

const isNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value)
}

const isNonNegativeNumber = (value: unknown): value is number => {
  return isNumber(value) && value >= 0
}

const isUnitInterval = (value: unknown): value is number => {
  return isNumber(value) && value >= 0 && value <= 1
}

const isNumberArray = (value: unknown): value is readonly number[] => {
  return Array.isArray(value) && value.every(isNumber)
}

export const isBodyMonitorBrowserMessage = (value: BrowserMessage): value is BodyMonitorBrowserMessage => {
  return !value.type.startsWith("audio_")
}

export const isAudioBrowserMessage = (value: BrowserMessage): value is AudioBrowserMessage => {
  return value.type.startsWith("audio_")
}

export const isBrowserMessage = (value: unknown): value is BrowserMessage => {
  if (!isRecord(value)) {
    return false
  }

  if (value.type === "audio_start") {
    return typeof value.filePath === "string" && value.filePath.trim() !== ""
  }

  if (value.type === "audio_stop") {
    return true
  }

  if (value.type === "audio_pause") {
    return true
  }

  if (value.type === "audio_resume") {
    return true
  }

  if (value.type === "audio_seek") {
    return isNonNegativeNumber(value.positionSec)
  }

  if (value.type === "audio_set_volume") {
    return isUnitInterval(value.left) && isUnitInterval(value.right)
  }

  if (value.type === "audio_alpha_relaxation_start") {
    return typeof value.durationMin === "number" && Number.isInteger(value.durationMin) && value.durationMin > 0
  }

  if (value.type === "audio_alpha_relaxation_stop") {
    return true
  }

  if (value.type === "audio_sleep_drowse_start") {
    return typeof value.durationMin === "number" && Number.isInteger(value.durationMin) && value.durationMin > 0
  }

  if (value.type === "audio_sleep_drowse_stop") {
    return true
  }

  if (value.type === "replay_pause") {
    return true
  }

  if (value.type === "replay_seek") {
    return isNumber(value.timestampMs)
  }

  if (value.type === "bodymonitor_stdio_configure") {
    return isStringArray(value.params)
  }

  if (value.type === "bodymonitor_stdio_start") {
    return true
  }

  if (value.type === "bodymonitor_stdio_stop") {
    return true
  }

  if (value.type === "bodymonitor_stdio_setparam") {
    return typeof value.key === "string" && typeof value.value === "string"
  }

  if (value.type === "bodymonitor_stdio_quit") {
    return true
  }

  if (value.type === "bodymonitor_server_list_devices") {
    return true
  }

  if (value.type === "bodymonitor_server_ping_device") {
    return typeof value.mac === "string" && value.mac.trim() !== ""
  }

  if (value.type === "bodymonitor_server_diagnose_eeg") {
    return typeof value.mac === "string" && value.mac.trim() !== ""
  }

  if (value.type === "bodymonitor_request_alpha_relaxation_start") {
    return typeof value.durationMin === "number" && Number.isInteger(value.durationMin) && value.durationMin > 0
  }

  if (value.type === "bodymonitor_request_alpha_relaxation_stop") {
    return true
  }

  if (value.type === "bodymonitor_request_sleep_drowse_start") {
    return typeof value.durationMin === "number" && Number.isInteger(value.durationMin) && value.durationMin > 0
  }

  if (value.type === "bodymonitor_request_sleep_drowse_stop") {
    return true
  }

  if (value.type === "replay_start") {
    return typeof value.sessionId === "number"
      && Number.isInteger(value.sessionId)
      && value.sessionId > 0
      && (value.timestampMs === undefined || isNumber(value.timestampMs))
  }

  if (value.type === "replay_stop") {
    return true
  }

  if (value.type === "replay_set_speed") {
    return typeof value.speed === "number" && REPLAY_SPEED_OPTIONS.includes(value.speed as ReplaySpeed)
  }

  return false
}

export const parseJsonLine = (line: string): unknown | null => {
  try {
    return JSON.parse(line) as unknown
  } catch {
    return null
  }
}

const normalizeMacAddress = (value: string): string | null => {
  const normalized = value.trim().toLowerCase()
  return normalized === "" ? null : normalized
}

export const parseDeviceInfoFromJson = (value: unknown): DeviceInfo | null => {
  if (!isRecord(value)) {
    return null
  }

  if (value.event !== "ble_device" || value.level !== "info") {
    return null
  }

  if (
    typeof value.index !== "number" ||
    typeof value.mac !== "string" ||
    typeof value.identifier !== "string" ||
    typeof value.device_type !== "string"
  ) {
    return null
  }

  const comPort = typeof value.com_port === "string" && value.com_port !== ""
    ? value.com_port
    : undefined
  const mac = normalizeMacAddress(value.mac)
  if (mac === null) {
    return null
  }

  return {
    index: value.index,
    mac,
    name: value.identifier,
    type: value.device_type,
    ...(comPort !== undefined ? { comPort } : {}),
    capabilities: deriveCapabilities(value.device_type, comPort),
  }
}

export const parseDeviceInfo = (line: string): DeviceInfo | null => {
  return parseDeviceInfoFromJson(parseJsonLine(line))
}

export const parseBlePingResultFromJson = (value: unknown): BodyMonitorPingResultEvent | null => {
  if (!isRecord(value)) {
    return null
  }

  if (value.event !== "ble_ping" || typeof value.ok !== "boolean" || typeof value.mac !== "string") {
    return null
  }

  const mac = normalizeMacAddress(value.mac)
  if (mac === null) {
    return null
  }

  return {
    type: "bodymonitor_ping_result",
    mac,
    ok: value.ok,
    identifier: typeof value.identifier === "string" ? value.identifier : undefined,
    message: typeof value.message === "string" ? value.message : undefined,
    elapsedMs: isNonNegativeNumber(value.elapsed_ms) ? value.elapsed_ms : undefined,
  }
}

const scanDeviceStages = new Set<BodyMonitorScanDeviceStage>([
  "queued",
  "probing",
  "complete",
  "failed",
  "not_connectable",
  "cancelled",
])

export const parseBleScanDeviceStatusFromJson = (value: unknown): Omit<BodyMonitorScanDeviceStatusEvent, "runId"> | null => {
  if (!isRecord(value)) {
    return null
  }

  if (
    value.event !== "ble_scan_device" ||
    typeof value.mac !== "string" ||
    typeof value.stage !== "string" ||
    !isNumber(value.index) ||
    !isNumber(value.total) ||
    !isNumber(value.completed)
  ) {
    return null
  }

  const stage = value.stage as BodyMonitorScanDeviceStage
  if (!scanDeviceStages.has(stage)) {
    return null
  }

  const mac = normalizeMacAddress(value.mac)
  if (mac === null) {
    return null
  }

  return {
    type: "bodymonitor_scan_device_status",
    mac,
    stage,
    index: Math.trunc(value.index),
    totalCount: Math.max(0, Math.trunc(value.total)),
    completedCount: Math.max(0, Math.trunc(value.completed)),
    message: typeof value.message === "string" ? value.message : undefined,
  }
}

export const getRuntimeEventTimestampMs = (value: unknown): number | null => {
  if (!isRecord(value)) {
    return null
  }

  if (isNumber(value.ep)) {
    return Math.round(value.ep * 1000)
  }

  if (typeof value.t === "string") {
    const parsed = Date.parse(value.t)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

export const parseHrNotificationEvent = (value: unknown): RuntimeHrNotificationEvent | null => {
  if (!isRecord(value) || value.e !== "hr" || !isNumber(value.h)) {
    return null
  }

  return {
    event: "hr_notification",
    epoch: isNumber(value.ep) ? value.ep : undefined,
    ts: typeof value.t === "string" ? value.t : undefined,
    hr: value.h,
    rr: isNumberArray(value.r) ? value.r : [],
  }
}

export const parseBreathPhaseEvent = (value: unknown): RuntimeBreathPhaseEvent | null => {
  if (!isRecord(value) || value.e !== "bp") {
    return null
  }

  const phase = value.p === "i"
    ? "inhale"
    : value.p === "e"
      ? "exhale"
      : null

  if (phase === null) {
    return null
  }

  const extremum = value.x === "pk"
    ? "peak"
    : value.x === "vy"
      ? "valley"
      : undefined

  return {
    event: "breath_phase",
    epoch: isNumber(value.ep) ? value.ep : undefined,
    ts: typeof value.t === "string" ? value.t : undefined,
    phase,
    extremum,
    hr: isNumber(value.h) ? value.h : undefined,
    rrRawMs: isNumber(value.r0) ? value.r0 : undefined,
    rrSmoothMs: isNumber(value.r1) ? value.r1 : undefined,
    deltaMs: isNumber(value.dm) ? value.dm : undefined,
    sampleIndex: isNumber(value.si) ? value.si : undefined,
  }
}

export const parseSnapshotEvent = (value: unknown): RuntimeSnapshotEvent | null => {
  if (!isRecord(value) || value.e !== "s") {
    return null
  }

  const snapshot: RuntimeSnapshotEvent = {
    event: "snapshot",
    epoch: isNumber(value.ep) ? value.ep : undefined,
    ts: typeof value.t === "string" ? value.t : undefined,
    raw: isNumber(value.rw) ? value.rw : undefined,
    poorSignal: isNumber(value.ps) ? value.ps : undefined,
    attention: isNumber(value.at) ? value.at : undefined,
    meditation: isNumber(value.md) ? value.md : undefined,
    delta: isNumber(value.d) ? value.d : undefined,
    theta: isNumber(value.th) ? value.th : undefined,
    alpha1: isNumber(value.a1) ? value.a1 : undefined,
    alpha2: isNumber(value.a2) ? value.a2 : undefined,
    beta1: isNumber(value.b1) ? value.b1 : undefined,
    beta2: isNumber(value.b2) ? value.b2 : undefined,
    gamma1: isNumber(value.g1) ? value.g1 : undefined,
    gamma2: isNumber(value.g2) ? value.g2 : undefined,
  }

  const hasMetric = EEG_SNAPSHOT_SERIES_KEYS.some((key) => snapshot[key] !== undefined)
  return hasMetric ? snapshot : null
}

export interface RuntimeAlgoBandPowerEvent {
  readonly event: "algo_band_power"
  readonly epoch?: number
  readonly delta?: number
  readonly theta?: number
  readonly alpha?: number
  readonly beta?: number
  readonly gamma?: number
}

export const parseAlgoBandPowerEvent = (value: unknown): RuntimeAlgoBandPowerEvent | null => {
  if (!isRecord(value) || value.e !== "ap") {
    return null
  }

  const event: RuntimeAlgoBandPowerEvent = {
    event: "algo_band_power",
    epoch: isNumber(value.ep) ? value.ep : undefined,
    delta: isNumber(value.d) ? value.d : undefined,
    theta: isNumber(value.th) ? value.th : undefined,
    alpha: isNumber(value.a) ? value.a : undefined,
    beta: isNumber(value.b) ? value.b : undefined,
    gamma: isNumber(value.g) ? value.g : undefined,
  }

  const hasMetric = event.delta !== undefined || event.theta !== undefined ||
    event.alpha !== undefined || event.beta !== undefined || event.gamma !== undefined
  return hasMetric ? event : null
}

export const parseStdioAck = (value: unknown): BodyMonitorStdioAckEvent | null => {
  if (!isRecord(value)) {
    return null
  }

  if (value.event !== "stdio_ack" || typeof value.cmd !== "string" || typeof value.ok !== "boolean") {
    return null
  }

  return {
    type: "bodymonitor_stdio_ack",
    cmd: value.cmd,
    ok: value.ok,
    error: typeof value.error === "string" ? value.error : undefined
  }
}

export const isStdioReadyLine = (value: unknown): boolean => {
  return isRecord(value) && value.event === "stdio_ready"
}

export const isServerReadyLine = (value: unknown): boolean => {
  return isRecord(value) && value.event === "server_ready"
}

export const toJson = (event: ServerEvent): string => {
  return JSON.stringify(event)
}

const EEG_DIAGNOSTICS_OVERALL_KEYS = new Set<BodyMonitorEegDiagnosticsEvent["overallKey"]>([
  "ok", "ble_missing", "com_missing", "checking", "error",
])

export const parseEegDiagnosticsFromJson = (value: unknown): BodyMonitorEegDiagnosticsEvent | null => {
  if (!isRecord(value)) {
    return null
  }

  if (value.event !== "eeg_diagnostics" || typeof value.mac !== "string") {
    return null
  }

  const mac = normalizeMacAddress(value.mac)
  if (mac === null) {
    return null
  }

  const overallKey = typeof value.overall_key === "string" && EEG_DIAGNOSTICS_OVERALL_KEYS.has(
    value.overall_key as BodyMonitorEegDiagnosticsEvent["overallKey"]
  )
    ? (value.overall_key as BodyMonitorEegDiagnosticsEvent["overallKey"])
    : "error"

  const ble: EegDiagnosticsBleInfo | undefined = isRecord(value.ble)
    ? {
        ok: typeof value.ble.ok === "boolean" ? value.ble.ok : false,
        identifier: typeof value.ble.identifier === "string" ? value.ble.identifier : undefined,
        elapsedMs: isNonNegativeNumber(value.ble.elapsed_ms) ? value.ble.elapsed_ms : undefined,
        message: typeof value.ble.message === "string" ? value.ble.message : undefined,
      }
    : undefined

  const com: EegDiagnosticsComInfo | undefined = isRecord(value.com)
    ? {
        found: typeof value.com.found === "boolean" ? value.com.found : false,
        port: typeof value.com.port === "string" ? value.com.port : undefined,
        description: typeof value.com.description === "string" ? value.com.description : undefined,
        pnpDeviceId: typeof value.com.pnp_device_id === "string" ? value.com.pnp_device_id : undefined,
      }
    : undefined

  return {
    type: "bodymonitor_eeg_diagnostics",
    mac,
    updatedAtMs: isNonNegativeNumber(value.updated_at_ms) ? value.updated_at_ms : Date.now(),
    ...(ble !== undefined ? { ble } : {}),
    ...(com !== undefined ? { com } : {}),
    overallKey,
    message: typeof value.message === "string" ? value.message : undefined,
    errorCode: typeof value.error_code === "number" ? value.error_code : undefined,
    errorStage: typeof value.error_stage === "string" ? value.error_stage : undefined,
  }
}