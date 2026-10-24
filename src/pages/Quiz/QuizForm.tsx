import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Image as ImageIcon,
  ListChecks,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import FormAside from '../../components/FormAside.tsx'
import FormField from '../../components/FormField.tsx'
import FormSection from '../../components/FormSection.tsx'
import ImageUrlInput from '../../components/ImageUrlInput.tsx'
import PageHeader from '../../components/PageHeader.tsx'
import { useToast } from '../../components/toast-context.ts'
import {
  inputClass,
  secondaryButtonClass,
  textareaClass,
} from '../../components/uiClasses.ts'
import {
  createQuizQuestion,
  getQuizQuestion,
  updateQuizQuestion,
} from '../../services/quiz.ts'
import { QUIZ_DIFFICULTIES, QUIZ_TOPICS } from '../../types/enums.ts'
import type { QuizQuestion, WithId } from '../../types/models.ts'
import { quizQuestionSchema } from '../../types/schemas.ts'
import type { QuizQuestionFormValues } from '../../types/schemas.ts'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

const EMPTY_VALUES: QuizQuestionFormValues = {
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  topic: 'Umum',
  difficulty: 'Mudah',
  imageUrl: '',
  isPublished: true,
}

function toFormValues(question: WithId<QuizQuestion>): QuizQuestionFormValues {
  const options = Array.isArray(question.options) ? question.options : []
  return {
    question: question.question ?? '',
    options: [0, 1, 2, 3].map((index) => options[index] ?? ''),
    correctIndex:
      typeof question.correctIndex === 'number' &&
      question.correctIndex >= 0 &&
      question.correctIndex <= 3
        ? question.correctIndex
        : 0,
    explanation: question.explanation ?? '',
    topic: question.topic ?? 'Umum',
    difficulty: question.difficulty ?? 'Mudah',
    imageUrl: question.imageUrl ?? '',
    isPublished: question.isPublished ?? false,
  }
}

export default function QuizForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showValidationHint, setShowValidationHint] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<QuizQuestionFormValues>({
    resolver: zodResolver(quizQuestionSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!id) return

    let active = true

    void (async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const question = await getQuizQuestion(id)
        if (!active) return
        if (!question) {
          setLoadError('Data soal kuis tidak ditemukan.')
          return
        }
        reset(toFormValues(question))
      } catch {
        if (active) setLoadError('Gagal memuat data soal kuis.')
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [id, reset])

  const options = useWatch({ control, name: 'options' })
  const isPublished = useWatch({ control, name: 'isPublished' })

  function updateOption(index: number, value: string) {
    const next = [...(options ?? ['', '', '', ''])]
    next[index] = value
    setValue('options', next, { shouldDirty: true })
  }

  const onSubmit = handleSubmit(
    async (values) => {
      setSaving(true)
      setSaveError(null)
      try {
        if (isEdit && id) {
          await updateQuizQuestion(id, values)
          showToast('Soal kuis diperbarui.')
        } else {
          await createQuizQuestion(values)
          showToast('Soal kuis ditambahkan.')
        }
        navigate('/kuis')
      } catch {
        setSaveError('Gagal menyimpan soal kuis. Silakan coba lagi.')
      } finally {
        setSaving(false)
      }
    },
    () => setShowValidationHint(true),
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-20 w-full rounded-2xl" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <PageHeader
          eyebrow="Konten"
          title="Soal Kuis"
          backTo="/kuis"
          backLabel="Kembali ke daftar soal"
        />
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={16} aria-hidden="true" />
            {loadError}
          </p>
          <Link to="/kuis" className={secondaryButtonClass}>
            Kembali ke daftar soal
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <PageHeader
        eyebrow="Konten"
        title={isEdit ? 'Ubah Soal Kuis' : 'Tambah Soal Kuis'}
        description="Setiap soal punya tepat empat opsi dengan satu jawaban benar dan pembahasannya."
        backTo="/kuis"
        backLabel="Kembali ke daftar soal"
      />

      {saveError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {saveError}
        </div>
      ) : null}

      {showValidationHint && Object.keys(errors).length > 0 ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          Periksa kembali isian yang ditandai merah sebelum menyimpan.
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]"
        noValidate
      >
        <div className="space-y-6">
          <FormSection
            icon={HelpCircle}
            title="Pertanyaan"
            description="Tulis pertanyaan singkat dan tentukan topik serta tingkat kesulitannya."
          >
            <FormField
              label="Pertanyaan"
              htmlFor="quiz-question"
              required
              error={errors.question?.message}
            >
              <textarea
                id="quiz-question"
                className={textareaClass}
                {...register('question')}
              />
            </FormField>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Topik"
                htmlFor="quiz-topic"
                required
                error={errors.topic?.message}
              >
                <select
                  id="quiz-topic"
                  className={inputClass}
                  {...register('topic')}
                >
                  {QUIZ_TOPICS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Tingkat kesulitan"
                htmlFor="quiz-difficulty"
                required
                error={errors.difficulty?.message}
              >
                <select
                  id="quiz-difficulty"
                  className={inputClass}
                  {...register('difficulty')}
                >
                  {QUIZ_DIFFICULTIES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </FormSection>

          <FormSection
            icon={ListChecks}
            title="Opsi jawaban"
            description="Tandai satu jawaban benar dengan memilih radio di sebelah kiri."
          >
            <Controller
              control={control}
              name="correctIndex"
              render={({ field }) => (
                <div className="space-y-2.5">
                  {(options ?? ['', '', '', '']).map((option, index) => {
                    const selected = field.value === index
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                          selected
                            ? 'border-brand-300 bg-brand-50/60 ring-1 ring-brand-200'
                            : 'border-cream-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="quiz-correct-index"
                          checked={selected}
                          onChange={() => field.onChange(index)}
                          aria-label={`Tandai opsi ${OPTION_LABELS[index]} sebagai jawaban benar`}
                          className="h-4 w-4 shrink-0 accent-brand-600"
                        />
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                            selected
                              ? 'bg-brand-600 text-white'
                              : 'bg-cream-100 text-stone-600'
                          }`}
                        >
                          {OPTION_LABELS[index]}
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(event) =>
                            updateOption(index, event.target.value)
                          }
                          placeholder={`Teks opsi ${OPTION_LABELS[index]}`}
                          aria-label={`Opsi ${OPTION_LABELS[index]}`}
                          className="w-full bg-transparent px-1 py-1 text-sm text-stone-800 outline-none placeholder:text-stone-400"
                        />
                        {selected ? (
                          <span className="hidden shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-brand-700 ring-1 ring-brand-200 sm:inline-flex">
                            <CheckCircle2 size={11} aria-hidden="true" />
                            Benar
                          </span>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )}
            />
            {errors.options ? (
              <p className="text-xs font-medium text-red-700">
                Semua opsi wajib diisi (tepat 4 opsi).
              </p>
            ) : null}
            {errors.correctIndex ? (
              <p className="text-xs font-medium text-red-700">
                Pilih satu jawaban benar.
              </p>
            ) : null}

            <FormField
              label="Pembahasan"
              htmlFor="quiz-explanation"
              required
              hint="Tampil setelah pengguna menjawab soal."
              error={errors.explanation?.message}
            >
              <textarea
                id="quiz-explanation"
                className={textareaClass}
                {...register('explanation')}
              />
            </FormField>
          </FormSection>

          <FormSection
            icon={ImageIcon}
            title="Gambar soal"
            description="Opsional, membantu soal yang berkaitan dengan visual."
          >
            <FormField label="Gambar" htmlFor="quiz-image">
              <Controller
                control={control}
                name="imageUrl"
                render={({ field }) => (
                  <ImageUrlInput
                    id="quiz-image"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    invalid={Boolean(errors.imageUrl)}
                  />
                )}
              />
            </FormField>
          </FormSection>
        </div>

        <FormAside
          published={Boolean(isPublished)}
          onPublishedChange={(value) =>
            setValue('isPublished', value, { shouldDirty: true })
          }
          saving={saving}
          cancelTo="/kuis"
          tip="Opsi yang dipilih sebagai jawaban benar ditandai hijau. Pastikan pembahasan menjelaskan alasannya."
        />
      </form>
    </div>
  )
}
