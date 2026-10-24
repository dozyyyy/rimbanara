import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2, Trees } from 'lucide-react'
import { Link } from 'react-router-dom'

import ConfirmDialog from '../../components/ConfirmDialog.tsx'
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
import { deleteForest, listForests } from '../../services/forests.ts'
import type { Forest, WithId } from '../../types/models.ts'

type StatusFilter = 'all' | 'published' | 'draft'

const PAGE_SIZE = 10

export default function ForestList() {
  const { showToast } = useToast()
  const [forests, setForests] = useState<WithId<Forest>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<WithId<Forest> | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true

    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await listForests()
        if (!active) return
        setForests(data)
      } catch {
        if (!active) return
        setError('Gagal memuat data hutan. Periksa koneksi lalu coba lagi.')
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
    return forests.filter((forest) => {
      if (statusFilter === 'published' && !forest.isPublished) return false
      if (statusFilter === 'draft' && forest.isPublished) return false
      if (query.length === 0) return true
      return (forest.nameLower ?? '').includes(query)
    })
  }, [forests, search, statusFilter])

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
      await deleteForest(deleteTarget.id)
      showToast(`Hutan "${deleteTarget.name}" dihapus.`)
      setDeleteTarget(null)
      setReloadKey((key) => key + 1)
    } catch {
      showToast('Gagal menghapus hutan. Silakan coba lagi.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns: TableColumn<WithId<Forest>>[] = [
    {
      key: 'image',
      header: 'Foto',
      className: 'hidden sm:table-cell',
      render: (forest) => (
        <Thumbnail src={forest.imageUrl} alt={`Foto ${forest.name}`} />
      ),
    },
    {
      key: 'name',
      header: 'Nama',
      className: 'min-w-32',
      render: (forest) => (
        <div>
          <p className="font-medium text-stone-800">{forest.name}</p>
          {forest.province ? (
            <p className="text-xs text-stone-500">{forest.province}</p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 md:hidden">
            <Tag>{forest.forestType}</Tag>
            <Tag>{forest.region}</Tag>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Jenis',
      className: 'hidden md:table-cell',
      render: (forest) => <Tag>{forest.forestType}</Tag>,
    },
    {
      key: 'region',
      header: 'Wilayah',
      className: 'hidden md:table-cell',
      render: (forest) => <Tag>{forest.region}</Tag>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (forest) => <PublishBadge published={forest.isPublished} />,
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'whitespace-nowrap',
      render: (forest) => (
        <div className="flex gap-1">
          <Link
            to={`/hutan/${forest.id}`}
            className={iconButtonClass}
            aria-label={`Ubah ${forest.name}`}
          >
            <Pencil size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Ubah</span>
          </Link>
          <button
            type="button"
            className={dangerIconButtonClass}
            onClick={() => setDeleteTarget(forest)}
            aria-label={`Hapus ${forest.name}`}
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
        title="Hutan"
        description="Kelola kawasan hutan Nusantara yang tampil di katalog dan peta aplikasi mobile."
        actions={
          <Link to="/hutan/baru" className={primaryButtonClass}>
            <Plus size={14} aria-hidden="true" />
            Tambah Hutan
          </Link>
        }
      />

      <Table
        columns={columns}
        rows={pageRows}
        rowKey={(forest) => forest.id}
        loading={loading}
        error={error}
        emptyIcon={Trees}
        emptyMessage={
          search || statusFilter !== 'all'
            ? 'Tidak ada hutan yang cocok dengan pencarian.'
            : 'Belum ada data hutan.'
        }
        emptyAction={
          search || statusFilter !== 'all' ? null : (
            <Link to="/hutan/baru" className={primaryButtonClass}>
              <Plus size={14} aria-hidden="true" />
              Tambah hutan
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
            searchPlaceholder="Cari nama hutan..."
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
        title="Hapus hutan ini?"
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
