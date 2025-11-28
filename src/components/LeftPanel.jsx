import { Eye, EyeOff, Database, Code2 } from 'lucide-react'
import { useState } from 'react'

const OPENAI_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
]

const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental)' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' }
]

function LeftPanel({
  apiProvider,
  setApiProvider,
  openaiApiKey,
  setOpenaiApiKey,
  geminiApiKey,
  setGeminiApiKey,
  selectedModel,
  setSelectedModel,
  dataObject,
  setDataObject,
  conversionTemplate,
  setConversionTemplate
}) {
  const [showOpenaiKey, setShowOpenaiKey] = useState(false)
  const [showGeminiKey, setShowGeminiKey] = useState(false)

  const currentModels = apiProvider === 'openai' ? OPENAI_MODELS : GEMINI_MODELS

  const handleProviderChange = (provider) => {
    setApiProvider(provider)
    // Set default model for the provider
    if (provider === 'openai') {
      setSelectedModel('gpt-4o-mini')
    } else {
      setSelectedModel('gemini-2.0-flash-exp')
    }
  }

  return (
    <div className="space-y-4">
      {/* API Provider Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">API Provider</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleProviderChange('openai')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
              apiProvider === 'openai'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            OpenAI
          </button>
          <button
            onClick={() => handleProviderChange('gemini')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
              apiProvider === 'gemini'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Gemini
          </button>
        </div>
      </div>

      {/* Model Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">⚙️</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Model</h2>
        </div>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        >
          {currentModels.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      {/* API Key Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">🔑</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">API Key</h2>
        </div>

        {apiProvider === 'openai' ? (
          <div>
            <div className="relative">
              <input
                type={showOpenaiKey ? 'text' : 'password'}
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              />
              <button
                onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOpenaiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              OpenAI API Key는 로컬 저장소에만 저장됩니다
            </p>
          </div>
        ) : (
          <div>
            <div className="relative">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              />
              <button
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showGeminiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Gemini API Key는 로컬 저장소에만 저장됩니다
            </p>
          </div>
        )}
      </div>

      {/* Data Object Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Database size={18} className="text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">데이터 객체</h2>
        </div>
        <div className="text-xs text-gray-500 mb-2">
          아동의 프로필 정보 (JSON)
        </div>
        <textarea
          value={dataObject}
          onChange={(e) => setDataObject(e.target.value)}
          className="w-full h-[400px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs font-mono resize-none"
          spellCheck={false}
        />
        {(() => {
          try {
            JSON.parse(dataObject)
            return (
              <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <span>✓</span>
                <span>유효한 JSON</span>
              </div>
            )
          } catch {
            return (
              <div className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <span>✗</span>
                <span>JSON 형식 오류</span>
              </div>
            )
          }
        })()}
      </div>

      {/* Conversion Template Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Code2 size={18} className="text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">변환 템플릿</h2>
        </div>
        <div className="text-xs text-gray-500 mb-2">
          데이터를 프롬프트로 변환하는 템플릿
        </div>
        <textarea
          value={conversionTemplate}
          onChange={(e) => setConversionTemplate(e.target.value)}
          className="w-full h-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          spellCheck={false}
        />
        <div className="text-xs text-gray-500 mt-2">
          💡 {'{'}profile.name{'}'}, {'{'}profile.age{'}'} 등의 형식으로 사용
        </div>
      </div>
    </div>
  )
}

export default LeftPanel
