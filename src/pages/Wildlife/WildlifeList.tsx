import { useEffect, useMemo, useState } from 'react'
import { Bird, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import ConfirmDialog from '../../components/ConfirmDialog.tsx'
import ConservationBadge from '../../components/ConservationBadge.tsx'
import PageHeader from '../../components/PageHeader.tsx'
import PublishBadge from '../../components/PublishBadge.tsx'
import Table, { TableToolbar } from '../../components/Table.tsx'
import type { TableColumn } from '../../components/Table.tsx'
import Tag from '../../components/Tag.tsx'
import Thumbnail from '../../components/Thumbnail.tsx'
import { useToast } from '../../components/toast-context.ts'
import {
  dangerIconButtonClass,
  iconButtonClass,
  primaryButtonClass,
} from '../../components/uiClasses.ts'
import { deleteWildlife, listWildlife } from '../../services/wildlife.ts'
import type { Wildlife, WithId } from '../../types/models.ts'

type StatusFilter = 'all' | 'published' | 'draft'

const PAGE_SIZE = 10

export default function WildlifeList() {
  const { showToast } = useToast()
  const [wildlife, setWildlife] = useState<WithId<Wildlife>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<WithId<Wildlife> | null>(
    null,
  )
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true

    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await listWildlife()
        if (!active) return
        setWildlife(data)
      } catch {
        if (!active) return
        setError('Gagal memuat data satwa. Periksa koneksi lalu coba lagi.')
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [reloadKey])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return wildlife.filter((item) => {
      if (statusFilter === 'published' && !item.isPublished) return false
      if (statusFilter === 'draft' && item.isPublished) return false
      if (query.length === 0) return true
      const haystack = [
        item.nameLower ?? '',
        item.scientificName ?? '',
        item.localName ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [wildlife, search, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  )

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteWildlife(deleteTarget.id)
      showToast(`Satwa "${deleteTarget.name}" dihapus.`)
      setDeleteTarget(null)
      setReloadKey((key) => key + 1)
    } catch {
      showToast('Gagal menghapus satwa. Silakan coba lagi.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns: TableColumn<WithId<Wildlife>>[] = [
    {
      key: 'image',
      header: 'Foto',
      className: 'hidden sm:table-cell',
      render: (item) => (
        <Thumbnail src={item.imageUrl} alt={`Foto ${item.name}`} />
      ),
    },
    {
      key: 'name',
      header: 'Nama',
      className: 'min-w-32',
      render: (item) => (
        <div>
          <p className="font-medium text-stone-800">{item.name}</p>
          <p className="text-xs text-stone-500 italic">{item.scientificName}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 md:hidden">
            <Tag>{item.type}</Tag>
            <Tag>{item.region}</Tag>
            <ConservationBadge status={item.conservationStatus} />
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Jenis',
      className: 'hidden md:table-cell',
      render: (item) => <Tag>{item.type}</Tag>,
    },
    {
      key: 'region',
      header: 'Wilayah',
      className: 'hidden md:table-cell',
      render: (item) => <Tag>{item.region}</Tag>,
    },
    {
      key: 'conservation',
      header: 'Konservasi',
      className: 'hidden md:table-cell',
      render: (item) => (
        <ConservationBadge status={item.conservationStatus} />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <PublishBadge published={item.isPublished} />,
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'whitespace-nowrap',
      render: (item) => (
        <div className="flex gap-1">
          <Link
            to={`/satwa/${item.id}`}
            className={iconButtonClass}
            aria-label={`Ubah ${item.name}`}
          >
            <Pencil size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Ubah</span>
          </Link>
          <button
            type="button"
            className={dangerIconButtonClass}
            onClick={() => setDeleteTarget(item)}
            aria-label={`Hapus ${item.name}`}
          >
            <Trash2 size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Hapus</span>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Konten"
        title="Satwa"
        description="Kelola data satwa yang tampil di aplikasi mobile, lengkap dengan status konservasi dan lokasi persebarannya."
        actions={
          <Link to="/satwa/baru" className={primaryButtonClass}>
            <Plus size={14} aria-hidden="true" />
            Tambah Satwa
          </Link>
        }
      />

      <Table
        columns={columns}
        rows={pageRows}
        rowKey={(item) => item.id}
        loading={loading}
        error={error}
        emptyIcon={Bird}
        emptyMessage={
          search || statusFilter !== 'all'
            ? 'Tidak ada satwa yang cocok dengan pencarian.'
            : 'Belum ada data satwa.'
        }
        emptyAction={
          search || statusFilter !== 'all' ? null : (
            <Link to="/satwa/baru" className={primaryButtonClass}>
              <Plus size={14} aria-hidden="true" />
              Tambah satwa
            </Link>
          )
        }
        toolbar={
          <TableToolbar
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPage(0)
            }}
            searchPlaceholder="Cari nama, nama ilmiah, atau nama lokal..."
            statusFilter={statusFilter}
            onStatusFilterChange={(value) => {
              setStatusFilter(value)
              setPage(0)
            }}
          />
        }
        pagination={{
          page: currentPage,
          pageCount,
          total: filtered.length,
          onPageChange: setPage,
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus satwa ini?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" akan dihapus permanen dari Firestore.`
            : undefined
        }
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
