import { createRequire } from 'node:module'
import prism from 'prismjs'

const require = createRequire(import.meta.url)
const loadLanguages = require('prismjs/components/index.js')

loadLanguages([
  'c',
  'clojure',
  'cpp',
  'csharp',
  'css',
  'dart',
  'docker',
  'elixir',
  'go',
  'markup',
  'java',
  'javascript',
  'json',
  'julia',
  'kotlin',
  'lua',
  'markdown',
  'pascal',
  'php',
  'python',
  'ruby',
  'rust',
  'sql',
  'typescript',
  'yaml',
])

export default prism
