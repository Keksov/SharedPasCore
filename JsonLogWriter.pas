unit JsonLogWriter;

{$mode objfpc}{$H+}

interface

uses
    SysUtils;

const
    RING_SIZE               = 256;

type
    TLogOutputFormat = (LOG_FORMAT_PLAIN,
        LOG_FORMAT_CSV,
        LOG_FORMAT_JSONL);

    {***************************************************************************
     * TStringRingBuffer
     *   Lock-free single-producer / single-consumer ring buffer of strings.
     *   push() from any ONE producer thread, tryPop() from a SINGLE consumer.
     ***************************************************************************}
    TStringRingBuffer = class
private
    Fitems                  : array[0..RING_SIZE - 1] of string;
    Fhead                   : Integer;
    Ftail                   : Integer;

public
    constructor Create;
    destructor  Destroy; override;

    procedure   push(const aLine: string);
    function    tryPop(out aLine: string): Boolean;
    end;

    {***************************************************************************
     * TJsonLogWriter
     *   Writes plain or structured log lines to a file or stdout.
     *   Supports plain, JSONL and CSV output formats.
     ***************************************************************************}
    TJsonLogWriter = class
private
    FlogFile                : TextFile;
    FlogFormat              : TLogOutputFormat;
    FcsvColumns             : Boolean;
    FuseStdout              : Boolean;
    FfileOpened             : Boolean;
    FcsvHeaderWritten       : Boolean;

public
    constructor Create(const aFileName: string;
        aLogFormat: TLogOutputFormat = LOG_FORMAT_PLAIN;
        aCsvColumns: Boolean = False);
    destructor  Destroy; override;

    procedure   writeLine(const aLine: string);
    function    writePlainLine(const aLine: string): Boolean;
    function    writesStructured(): Boolean;
    procedure   finish;

    property UsesStdout: Boolean read FuseStdout;
    property LogFormat: TLogOutputFormat read FlogFormat;
    end;

function    jsonLogTimestamp(const aApp: string): string;
function    jsonLogFloat3(aValue: Double): string;

implementation

var
    gDotFmt: TFormatSettings;

function extractJsonStringValue(const aLine: string; const aKey: string): string;
var
    k: string;
    p: SizeInt;
    s: SizeInt;
    e: SizeInt;
begin
    Result := '';
    k := '"' + aKey + '":"';
    p := Pos(k, aLine);
    if p = 0 then
        Exit;

    s := p + Length(k);
    e := s;
    while e <= Length(aLine) do
    begin
        if (aLine[e] = '"') and ((e = s) or (aLine[e - 1] <> '\')) then
            Break;
        Inc(e);
    end;
    Result := Copy(aLine, s, e - s);
end;

function extractJsonRawValue(const aLine: string; const aKey: string): string;
var
    k: string;
    p: SizeInt;
    s: SizeInt;
    e: SizeInt;
begin
    Result := '';
    k := '"' + aKey + '":';
    p := Pos(k, aLine);
    if p = 0 then
        Exit;

    s := p + Length(k);
    e := s;
    while (e <= Length(aLine)) and (aLine[e] <> ',') and (aLine[e] <> '}') do
        Inc(e);

    Result := Trim(Copy(aLine, s, e - s));
end;

function extractJsonArrayItems(const aLine: string; const aKey: string): string;
var
    k: string;
    p: SizeInt;
    s: SizeInt;
    e: SizeInt;
    depth: Integer;
begin
    Result := '';
    k := '"' + aKey + '":[';
    p := Pos(k, aLine);
    if p = 0 then
        Exit;

    s := p + Length(k);
    e := s;
    depth := 1;
    while e <= Length(aLine) do
    begin
        if aLine[e] = '[' then
            Inc(depth)
        else if aLine[e] = ']' then
        begin
            Dec(depth);
            if depth = 0 then
                Break;
        end;
        Inc(e);
    end;

    Result := Trim(Copy(aLine, s, e - s));
end;

function csvEscape(const aText: string): string;
begin
    Result := '"' + StringReplace(aText, '"', '""', [rfReplaceAll]) + '"';
end;

function buildCsvLine(const aJsonLine: string): string;
var
    ep: string;
    ev: string;
    hr: string;
    lv: string;
    rr: string;
    ts: string;
    app: string;
    mac: string;
    msg: string;
    idx: string;
    phase: string;
    ticks: string;
    source: string;
    comPort: string;
    deltaMs: string;
    rawRrMs: string;
    extremum: string;
    identifier: string;
    deviceType: string;
    smoothRrMs: string;
    sampleIndex: string;
begin
    app := extractJsonStringValue(aJsonLine, 'app');
    ts := extractJsonStringValue(aJsonLine, 'ts');
    ev := extractJsonStringValue(aJsonLine, 'event');
    hr := extractJsonRawValue(aJsonLine, 'hr');
    rr := extractJsonArrayItems(aJsonLine, 'rr');
    lv := extractJsonStringValue(aJsonLine, 'level');
    ep := extractJsonRawValue(aJsonLine, 'epoch');
    idx := extractJsonRawValue(aJsonLine, 'index');
    mac := extractJsonStringValue(aJsonLine, 'mac');
    msg := extractJsonStringValue(aJsonLine, 'message');
    phase := extractJsonStringValue(aJsonLine, 'phase');
    ticks := extractJsonRawValue(aJsonLine, 'ticks');
    source := extractJsonStringValue(aJsonLine, 'source');
    comPort := extractJsonStringValue(aJsonLine, 'com_port');
    deltaMs := extractJsonRawValue(aJsonLine, 'delta_ms');
    extremum := extractJsonStringValue(aJsonLine, 'extremum');
    rawRrMs := extractJsonRawValue(aJsonLine, 'rr_raw_ms');
    identifier := extractJsonStringValue(aJsonLine, 'identifier');
    deviceType := extractJsonStringValue(aJsonLine, 'device_type');
    sampleIndex := extractJsonRawValue(aJsonLine, 'sample_index');
    smoothRrMs := extractJsonRawValue(aJsonLine, 'rr_smooth_ms');

    Result := csvEscape(app) + ',' +
              csvEscape(ts) + ',' +
              ticks + ',' +
              ep + ',' +
              csvEscape(ev) + ',' +
              idx + ',' +
              csvEscape(mac) + ',' +
              csvEscape(identifier) + ',' +
              csvEscape(deviceType) + ',' +
              csvEscape(comPort) + ',' +
              hr + ',' +
              csvEscape(rr) + ',' +
              csvEscape(phase) + ',' +
              rawRrMs + ',' +
              smoothRrMs + ',' +
              csvEscape(extremum) + ',' +
              deltaMs + ',' +
              sampleIndex + ',' +
              csvEscape(source) + ',' +
              csvEscape(lv) + ',' +
              csvEscape(msg);
end;

{ TStringRingBuffer }

constructor TStringRingBuffer.Create;
var
    i: Integer;
begin
    inherited Create;
    Fhead := 0;
    Ftail := 0;
    for i := 0 to RING_SIZE - 1 do
        Fitems[i] := '';
end;

destructor TStringRingBuffer.Destroy;
var
    i: Integer;
begin
    for i := 0 to RING_SIZE - 1 do
        Fitems[i] := '';
    inherited Destroy;
end;

procedure TStringRingBuffer.push(const aLine: string);
var
    next: Integer;
begin
    next := (Fhead + 1) mod RING_SIZE;
    if next = Ftail then
        Exit;  // ring full — drop
    Fitems[Fhead] := aLine;
    Fhead := next;
end;

function TStringRingBuffer.tryPop(out aLine: string): Boolean;
begin
    if Ftail = Fhead then
    begin
        aLine := '';
        Result := False;
        Exit;
    end;
    aLine := Fitems[Ftail];
    Fitems[Ftail] := '';
    Ftail := (Ftail + 1) mod RING_SIZE;
    Result := True;
end;

{ TJsonLogWriter }

constructor TJsonLogWriter.Create(const aFileName: string;
    aLogFormat: TLogOutputFormat;
    aCsvColumns: Boolean);
begin
    inherited Create;
    FlogFormat := aLogFormat;
    FcsvColumns := aCsvColumns;
    FcsvHeaderWritten := False;

    if aFileName = '-' then
    begin
        FuseStdout := True;
        FfileOpened := False;
    end
    else
    begin
        FuseStdout := False;
        AssignFile(FlogFile, aFileName);
        Rewrite(FlogFile);
        FfileOpened := True;
    end;
end;

destructor TJsonLogWriter.Destroy;
begin
    if FfileOpened then
        CloseFile(FlogFile);
    inherited Destroy;
end;

procedure TJsonLogWriter.writeLine(const aLine: string);
var
    out_: string;
begin
    if FlogFormat = LOG_FORMAT_PLAIN then
        Exit;

    if (FlogFormat = LOG_FORMAT_CSV) and FcsvColumns and (not FcsvHeaderWritten) then
    begin
        out_ := 'app,ts,ticks,epoch,event,index,mac,identifier,device_type,com_port,hr,rr,phase,rr_raw_ms,rr_smooth_ms,extremum,delta_ms,sample_index,source,level,message' + LineEnding;
        if FuseStdout then
        begin
            Write(out_);
            Flush(Output);
        end
        else
            Write(FlogFile, out_);
        FcsvHeaderWritten := True;
    end;

    if FlogFormat = LOG_FORMAT_CSV then
        out_ := buildCsvLine(aLine)
    else
        out_ := aLine;

    if FuseStdout then
    begin
        WriteLn(out_);
        Flush(Output);
    end
    else
    begin
        WriteLn(FlogFile, out_);
        System.Flush(FlogFile);
    end;
end;

function TJsonLogWriter.writePlainLine(const aLine: string): Boolean;
begin
    Result := False;
    if FlogFormat <> LOG_FORMAT_PLAIN then
        Exit;

    if FuseStdout then
    begin
        WriteLn(aLine);
        Flush(Output);
    end
    else
    begin
        WriteLn(FlogFile, aLine);
        System.Flush(FlogFile);
    end;
    Result := True;
end;

function TJsonLogWriter.writesStructured(): Boolean;
begin
    Result := FlogFormat <> LOG_FORMAT_PLAIN;
end;

procedure TJsonLogWriter.finish;
begin
    if not FuseStdout then
        System.Flush(FlogFile);
end;

{ Standalone helpers }

function jsonLogFloat3(aValue: Double): string;
begin
    Result := FormatFloat('0.000', aValue, gDotFmt);
end;

function jsonLogTimestamp(const aApp: string): string;
var
    n: TDateTime;
    epoch: Double;
    ticks: QWord;
begin
    n := Now;
    ticks := GetTickCount64;
    epoch := (n - 25569) * 86400.0;
    Result := '"app":"' + aApp + '"' +
              ',"ts":"' + FormatDateTime('yyyy.mm.dd hh:nn:ss.zzz', n) + '"' +
              ',"ticks":' + IntToStr(Int64(ticks)) +
              ',"epoch":' + jsonLogFloat3(epoch);
end;

initialization
    gDotFmt := DefaultFormatSettings;
    gDotFmt.DecimalSeparator := '.';
    gDotFmt.ThousandSeparator := #0;

end.
