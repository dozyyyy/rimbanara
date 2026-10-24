import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react'
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
import { deleteArticle, listArticles } from '../../services/articles.ts'
import type { Article, WithId } from '../../types/models.ts'

type StatusFilter = 'all' | 'published' | 'draft'

const PAGE_SIZE = 10

export default function ArticleList() {
  const { showToast } = useToast()
  const [articles, setArticles] = useState<WithId<Article>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<WithId<Article> | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true

    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await listArticles()
        if (!active) return
        setArticles(data)
      } catch {
        if (!active) return
        setError('Gagal memuat data artikel. Periksa koneksi lalu coba lagi.')
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
    return articles.filter((article) => {
      if (statusFilter === 'published' && !article.isPublished) return false
      if (statusFilter === 'draft' && article.isPublished) return false
      if (query.length === 0) return true
      return `${article.title ?? ''} ${article.author ?? ''}`
        .toLowerCase()
        .includes(query)
    })
  }, [articles, search, statusFilter])

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
      await deleteArticle(deleteTarget.id)
      showToast(`Artikel "${deleteTarget.title}" dihapus.`)
      setDeleteTarget(null)
      setReloadKey((key) => key + 1)
    } catch {
      showToast('Gagal menghapus artikel. Silakan coba lagi.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns: TableColumn<WithId<Article>>[] = [
    {
      key: 'image',
      header: 'Sampul',
      className: 'hidden sm:table-cell',
      render: (article) => (
        <Thumbnail src={article.coverImageUrl} alt={`Sampul ${article.title}`} />
      ),
    },
    {
      key: 'title',
      header: 'Judul',
      className: 'min-w-40',
      render: (article) => (
        <div>
          <p className="font-medium text-stone-800">{article.title}</p>
          <p className="text-xs text-stone-500">{article.author}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 md:hidden">
            <Tag>{article.category}</Tag>
            <span className="text-[11px] text-stone-500">
              {article.readMinutes} menit baca
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      className: 'hidden md:table-cell',
      render: (article) => <Tag>{article.category}</Tag>,
    },
    {
      key: 'readMinutes',
      header: 'Baca',
      className: 'hidden md:table-cell',
      render: (article) => `${article.readMinutes} menit`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (article) => <PublishBadge published={article.isPublished} />,
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'whitespace-nowrap',
      render: (article) => (
        <div className="flex gap-1">
          <Link
            to={`/artikel/${article.id}`}
            className={iconButtonClass}
            aria-label={`Ubah ${article.title}`}
          >
            <Pencil size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Ubah</span>
          </Link>
          <button
            type="button"
            className={dangerIconButtonClass}
            onClick={() => setDeleteTarget(article)}
            aria-label={`Hapus ${article.title}`}
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
        title="Artikel"
        description="Kelola artikel edukasi tentang pelestarian hutan dan perlindungan satwa untuk pembaca di aplikasi mobile."
        actions={
          <Link to="/artikel/baru" className={primaryButtonClass}>
            <Plus size={14} aria-hidden="true" />
            Tambah Artikel
          </Link>
        }
      />

      <Table
        columns={columns}
        rows={pageRows}
        rowKey={(article) => article.id}
        loading={loading}
        error={error}
        emptyIcon={BookOpen}
        emptyMessage={
          search || statusFilter !== 'all'
            ? 'Tidak ada artikel yang cocok dengan pencarian.'
            : 'Belum ada artikel.'
        }
        emptyAction={
          search || statusFilter !== 'all' ? null : (
            <Link to="/artikel/baru" className={primaryButtonClass}>
              <Plus size={14} aria-hidden="true" />
              Tambah artikel
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
            searchPlaceholder="Cari judul atau penulis..."
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
        title="Hapus artikel ini?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" akan dihapus permanen dari Firestore.`
            : undefined
        }
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
