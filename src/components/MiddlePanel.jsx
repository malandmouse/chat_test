import { Settings, Eye } from 'lucide-react'

function MiddlePanel({ systemPrompt, setSystemPrompt, finalPrompt }) {
  return (
    <div className="space-y-4">
      {/* System Prompt Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Settings size={18} className="text-orange-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">시스템 프롬프트</h2>
        </div>
        <div className="text-xs text-gray-500 mb-2">
          AI의 페르소나 및 제약조건 설정
        </div>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full h-[400px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm resize-none"
          spellCheck={false}
        />
      </div>

      {/* Final Prompt Preview Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Eye size={18} className="text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">최종 프롬프트 미리보기</h2>
        </div>
        <div className="text-xs text-gray-500 mb-2">
          실시간으로 업데이트되는 최종 프롬프트
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-[400px] overflow-y-auto">
          <pre className="text-xs whitespace-pre-wrap font-mono text-gray-700">
            {finalPrompt || '프롬프트가 생성되지 않았습니다.'}
          </pre>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          총 {finalPrompt.length.toLocaleString()} 글자
        </div>
      </div>
    </div>
  )
}

export default MiddlePanel
