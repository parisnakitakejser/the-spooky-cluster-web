{{/*
Chart name, overridable.
*/}}
{{- define "spooky-cluster-site.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Fully qualified name. Release name wins unless it already contains the chart
name, so `helm install spooky-cluster-site ./charts/...` does not stutter.
*/}}
{{- define "spooky-cluster-site.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- if not (contains $name .Release.Name) }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "spooky-cluster-site.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "spooky-cluster-site.labels" -}}
helm.sh/chart: {{ include "spooky-cluster-site.chart" . }}
{{ include "spooky-cluster-site.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels. Immutable on a Deployment, so nothing version-dependent here.
*/}}
{{- define "spooky-cluster-site.selectorLabels" -}}
app.kubernetes.io/name: {{ include "spooky-cluster-site.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "spooky-cluster-site.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "spooky-cluster-site.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Image reference. A digest pins the exact build and wins over any tag.
*/}}
{{- define "spooky-cluster-site.image" -}}
{{- if .Values.image.digest }}
{{- printf "%s@%s" .Values.image.repository .Values.image.digest }}
{{- else }}
{{- printf "%s:%s" .Values.image.repository (.Values.image.tag | default .Chart.AppVersion) }}
{{- end }}
{{- end }}
