import { useState } from 'react'
import type { LatLngExpression } from 'leaflet'
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import { MapPin, MousePointerClick, Plus, Trash2 } from 'lucide-react'

import type { GeoLocationFormValues } from '../types/schemas.ts'
import {
  errorTextClass,
  ghostButtonClass,
  inputClass,
  secondaryButtonClass,
} from './uiClasses.ts'

import 'leaflet/dist/leaflet.css'

const INDONESIA_CENTER: LatLngExpression = [-2.5, 118]

function MapClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

interface LocationsEditorProps {
  value: GeoLocationFormValues[]
  onChange: (value: GeoLocationFormValues[]) => void
  /** True when the form has pending validation errors under `locations`. */
  invalid?: boolean
}

/**
 * Editor for `locations: GeoLocation[]` (PRD §5.2/§8.2). Rows hold label, lat
 * and lng; clicking the Leaflet map fills the coordinates of the active row.
 */
export default function LocationsEditor({
  value,
  onChange,
  invalid = false,
}: LocationsEditorProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  function updateRow(index: number, patch: Partial<GeoLocationFormValues>) {
    onChange(
      value.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    )
  }

  function addRow() {
    onChange([...value, { label: '', lat: Number.NaN, lng: Number.NaN }])
    setActiveIndex(value.length)
  }

  function removeRow(index: number) {
    onChange(value.filter((_, rowIndex) => rowIndex !== index))
    setActiveIndex((current) => Math.max(0, Math.min(current, value.length - 2)))
  }

  function handlePick(lat: number, lng: number) {
    if (value.length === 0) return
    updateRow(activeIndex, {
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
    })
  }

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <div className="flex items-start gap-2 rounded-xl border border-dashed border-cream-300 bg-cream-50 px-3.5 py-3 text-xs leading-relaxed text-stone-500">
          <MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          Belum ada lokasi. Tambahkan minimal satu agar item muncul di peta
          aplikasi mobile.
        </div>
      ) : null}

      {value.map((row, index) => {
        const active = activeIndex === index
        const labelInvalid = row.label.trim().length === 0
        const latInvalid = !Number.isFinite(row.lat)
        const lngInvalid = !Number.isFinite(row.lng)

        return (
          <div
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`rounded-xl border transition ${
              active
                ? 'border-brand-300 bg-brand-50/40 ring-1 ring-brand-200'
                : 'border-cream-200 bg-white hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between gap-2 border-b border-cream-200/70 px-3 py-2">
              <p className="flex items-center gap-2 text-xs font-medium text-stone-700">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-semibold ${
                    active
                      ? 'bg-brand-600 text-white'
                      : 'bg-cream-100 text-stone-600'
                  }`}
                >
                  {index + 1}
                </span>
                Lokasi {index + 1}
                {active ? (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-brand-700 ring-1 ring-brand-200">
                    Aktif di peta
                  </span>
                ) : null}
              </p>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className={`${ghostButtonClass} px-2 py-1 text-xs hover:text-red-700`}
                aria-label={`Hapus lokasi ${index + 1}`}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-3 p-3 sm:grid-cols-[1fr_8rem_8rem]">
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-stone-500">
                  Label lokasi
                </span>
                <input
                  type="text"
                  value={row.label}
                  onChange={(event) =>
                    updateRow(index, { label: event.target.value })
                  }
                  placeholder="mis. TN Gunung Leuser"
                  aria-label={`Label lokasi ${index + 1}`}
                  className={`${inputClass} ${
                    labelInvalid && invalid ? 'border-red-400' : ''
                  }`}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-stone-500">
                  Latitude
                </span>
                <input
                  type="number"
                  step="any"
                  value={Number.isFinite(row.lat) ? row.lat : ''}
                  onChange={(event) =>
                    updateRow(index, {
                      lat:
                        event.target.value === ''
                          ? Number.NaN
                          : Number(event.target.value),
                    })
                  }
                  placeholder="-2.5"
                  aria-label={`Latitude ${index + 1}`}
                  className={`${inputClass} ${
                    latInvalid && invalid ? 'border-red-400' : ''
                  }`}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-stone-500">
                  Longitude
                </span>
                <input
                  type="number"
                  step="any"
                  value={Number.isFinite(row.lng) ? row.lng : ''}
                  onChange={(event) =>
                    updateRow(index, {
                      lng:
                        event.target.value === ''
                          ? Number.NaN
                          : Number(event.target.value),
                    })
                  }
                  placeholder="118"
                  aria-label={`Longitude ${index + 1}`}
                  className={`${inputClass} ${
                    lngInvalid && invalid ? 'border-red-400' : ''
                  }`}
                />
              </label>
            </div>
          </div>
        )
      })}

      {invalid ? (
        <p className={errorTextClass}>
          Periksa kembali lokasi: label, latitude, dan longitude wajib diisi.
        </p>
      ) : null}

      <button type="button" onClick={addRow} className={secondaryButtonClass}>
        <Plus size={14} aria-hidden="true" />
        Tambah lokasi
      </button>

      <div className="relative h-64 overflow-hidden rounded-xl border border-cream-200">
        <MapContainer
          center={INDONESIA_CENTER}
          zoom={4}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onPick={handlePick} />
          {value
            .filter(
              (row) =>
                Number.isFinite(row.lat) &&
                Number.isFinite(row.lng) &&
                Math.abs(row.lat) <= 90 &&
                Math.abs(row.lng) <= 180,
            )
            .map((row, index) => {
              const rowIndex = value.indexOf(row)
              const active = rowIndex === activeIndex
              return (
                <CircleMarker
                  key={`${row.label}-${index}`}
                  center={[row.lat, row.lng]}
                  radius={active ? 9 : 6}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 2,
                    fillColor: active ? '#2f5928' : '#4e8a42',
                    fillOpacity: active ? 0.95 : 0.7,
                  }}
                />
              )
            })}
        </MapContainer>
        <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-medium text-stone-600 shadow-sm ring-1 ring-cream-200">
          <MousePointerClick size={12} aria-hidden="true" />
          Klik peta untuk mengisi lokasi aktif
        </div>
      </div>
    </div>
  )
}
