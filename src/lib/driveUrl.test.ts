import assert from 'node:assert/strict'
import { test } from 'node:test'

import { convertDriveUrl, isHttpsUrl } from './driveUrl.ts'

test('converts a Drive "view" share link with query string', () => {
  assert.equal(
    convertDriveUrl(
      'https://drive.google.com/file/d/1AbCdEfGhIjK/view?usp=sharing',
    ),
    'https://drive.google.com/uc?export=view&id=1AbCdEfGhIjK',
  )
})

test('converts a Drive "view" link without query string', () => {
  assert.equal(
    convertDriveUrl('https://drive.google.com/file/d/1AbCdEfGhIjK/view'),
    'https://drive.google.com/uc?export=view&id=1AbCdEfGhIjK',
  )
})

test('converts Drive "edit" and "preview" links', () => {
  assert.equal(
    convertDriveUrl('https://drive.google.com/file/d/1AbCdEfGhIjK/edit?usp=drivesdk'),
    'https://drive.google.com/uc?export=view&id=1AbCdEfGhIjK',
  )
  assert.equal(
    convertDriveUrl('https://drive.google.com/file/d/1AbCdEfGhIjK/preview'),
    'https://drive.google.com/uc?export=view&id=1AbCdEfGhIjK',
  )
})

test('leaves URLs that are not Drive share links untouched', () => {
  const direct = 'https://drive.google.com/uc?export=view&id=1AbCdEfGhIjK'
  assert.equal(convertDriveUrl(direct), direct)

  const lh3 = 'https://lh3.googleusercontent.com/d/1AbCdEfGhIjK=w1200'
  assert.equal(convertDriveUrl(lh3), lh3)

  const other = 'https://images.example.org/satwa/orangutan.jpg'
  assert.equal(convertDriveUrl(other), other)
})

test('tolerates empty and invalid input without throwing', () => {
  assert.equal(convertDriveUrl(''), '')
  assert.equal(convertDriveUrl('   '), '')
  assert.equal(convertDriveUrl('not a url'), 'not a url')
  assert.equal(
    convertDriveUrl('http://drive.google.com/file/d/abc/view'),
    'http://drive.google.com/file/d/abc/view',
  )
})

test('trims surrounding whitespace before converting', () => {
  assert.equal(
    convertDriveUrl('  https://drive.google.com/file/d/abc/view?usp=sharing  '),
    'https://drive.google.com/uc?export=view&id=abc',
  )
})

test('isHttpsUrl accepts only https URLs', () => {
  assert.equal(isHttpsUrl('https://example.org/foto.jpg'), true)
  assert.equal(isHttpsUrl('  https://example.org/foto.jpg  '), true)
  assert.equal(isHttpsUrl('http://example.org/foto.jpg'), false)
  assert.equal(isHttpsUrl('example.org/foto.jpg'), false)
  assert.equal(isHttpsUrl(''), false)
  assert.equal(isHttpsUrl('https://'), false)
})
