import { Eye, EyeOff, Database, Code2 } from 'lucide-react'
import { useState } from 'react'

function LeftPanel({ apiKey, setApiKey, dataObject, setDataObject, conversionTemplate, setConversionTemplate }) {
  const [showApiKey, setShowApiKey] = useState(false)

  return (
    <div className="space-y-4">
      {/* API Key Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">🔑</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">API Key</h2>
        </div>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          OpenAI API Key는 로컬 저장소에만 저장됩니다
        </p>
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
