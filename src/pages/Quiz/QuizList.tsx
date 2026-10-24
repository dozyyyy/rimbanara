import { useEffect, useMemo, useState } from 'react'
import { HelpCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import ConfirmDialog from '../../components/ConfirmDialog.tsx'
import PageHeader from '../../components/PageHeader.tsx'
import PublishBadge from '../../components/PublishBadge.tsx'
import Table, { TableToolbar } from '../../components/Table.tsx'
import type { TableColumn } from '../../components/Table.tsx'
import Tag from '../../components/Tag.tsx'
import { useToast } from '../../components/toast-context.ts'
import {
  dangerIconButtonClass,
  iconButtonClass,
  primaryButtonClass,
} from '../../components/uiClasses.ts'
import { deleteQuizQuestion, listQuizQuestions } from '../../services/quiz.ts'
import type { QuizQuestion, WithId } from '../../types/models.ts'

type StatusFilter = 'all' | 'published' | 'draft'

const PAGE_SIZE = 10

export default function QuizList() {
  const { showToast } = useToast()
  const [questions, setQuestions] = useState<WithId<QuizQuestion>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<WithId<QuizQuestion> | null>(
    null,
  )
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true

    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await listQuizQuestions()
        if (!active) return
        setQuestions(data)
      } catch {
        if (!active) return
        setError('Gagal memuat data soal kuis. Periksa koneksi lalu coba lagi.')
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
    return questions.filter((question) => {
      if (statusFilter === 'published' && !question.isPublished) return false
      if (statusFilter === 'draft' && question.isPublished) return false
      if (query.length === 0) return true
      return (question.question ?? '').toLowerCase().includes(query)
    })
  }, [questions, search, statusFilter])

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
      await deleteQuizQuestion(deleteTarget.id)
      showToast('Soal kuis dihapus.')
      setDeleteTarget(null)
      setReloadKey((key) => key + 1)
    } catch {
      showToast('Gagal menghapus soal kuis. Silakan coba lagi.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns: TableColumn<WithId<QuizQuestion>>[] = [
    {
      key: 'question',
      header: 'Pertanyaan',
      className: 'max-w-md min-w-40',
      render: (question) => (
        <div>
          <p className="font-medium text-stone-800">{question.question}</p>
          <p className="text-xs text-stone-500">
            Jawaban benar: {question.options?.[question.correctIndex] ?? '-'}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 md:hidden">
            <Tag>{question.topic}</Tag>
            <Tag>{question.difficulty}</Tag>
          </div>
        </div>
      ),
    },
    {
      key: 'topic',
      header: 'Topik',
      className: 'hidden md:table-cell',
      render: (question) => <Tag>{question.topic}</Tag>,
    },
    {
      key: 'difficulty',
      header: 'Kesulitan',
      className: 'hidden md:table-cell',
      render: (question) => <Tag>{question.difficulty}</Tag>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (question) => <PublishBadge published={question.isPublished} />,
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'whitespace-nowrap',
      render: (question) => (
        <div className="flex gap-1">
          <Link
            to={`/kuis/${question.id}`}
            className={iconButtonClass}
            aria-label="Ubah soal kuis"
          >
            <Pencil size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Ubah</span>
          </Link>
          <button
            type="button"
            className={dangerIconButtonClass}
            onClick={() => setDeleteTarget(question)}
            aria-label="Hapus soal kuis"
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
        title="Soal Kuis"
        description="Kelola bank soal pilihan ganda beserta pembahasannya untuk kuis di aplikasi mobile."
        actions={
          <Link to="/kuis/baru" className={primaryButtonClass}>
            <Plus size={14} aria-hidden="true" />
            Tambah Soal
          </Link>
        }
      />

      <Table
        columns={columns}
        rows={pageRows}
        rowKey={(question) => question.id}
        loading={loading}
        error={error}
        emptyIcon={HelpCircle}
        emptyMessage={
          search || statusFilter !== 'all'
            ? 'Tidak ada soal yang cocok dengan pencarian.'
            : 'Belum ada soal kuis.'
        }
        emptyAction={
          search || statusFilter !== 'all' ? null : (
            <Link to="/kuis/baru" className={primaryButtonClass}>
              <Plus size={14} aria-hidden="true" />
              Tambah soal
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
            searchPlaceholder="Cari pertanyaan..."
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
        title="Hapus soal kuis ini?"
        description={
          deleteTarget
            ? `Soal "${deleteTarget.question}" akan dihapus permanen.`
            : undefined
        }
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
