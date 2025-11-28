import { Sparkles, Loader2, AlertCircle, FileJson, Gamepad2 } from 'lucide-react'

function RightPanel({ apiResponse, isLoading, error, onGenerate }) {
  // Extract game_config from response
  const extractGameConfig = () => {
    if (!apiResponse?.choices?.[0]?.message?.content) return null

    try {
      const content = JSON.parse(apiResponse.choices[0].message.content)
      return content.game_config || null
    } catch {
      return null
    }
  }

  const gameConfig = extractGameConfig()

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>생성 중...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Generate</span>
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-900">오류 발생</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Raw JSON Response */}
      {apiResponse && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileJson size={18} className="text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Raw JSON Response</h2>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[400px] overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap font-mono text-gray-700">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>
              Usage: {apiResponse.usage?.prompt_tokens || 0} prompt + {apiResponse.usage?.completion_tokens || 0} completion = {apiResponse.usage?.total_tokens || 0} tokens
            </span>
            <span>
              Model: {apiResponse.model || 'N/A'}
            </span>
          </div>
        </div>
      )}

      {/* Game Config Extraction */}
      {gameConfig && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Gamepad2 size={18} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Game Config</h2>
          </div>
          <div className="text-xs text-gray-500 mb-4">
            게임 서버에 전달될 핵심 파라미터
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Target Emotion */}
            {gameConfig.target_emotion && (
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
                <div className="text-xs text-pink-600 font-medium mb-1">Target Emotion</div>
                <div className="text-lg font-bold text-pink-900">{gameConfig.target_emotion}</div>
              </div>
            )}

            {/* Difficulty Level */}
            {gameConfig.difficulty_level && (
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
                <div className="text-xs text-orange-600 font-medium mb-1">Difficulty</div>
                <div className="text-lg font-bold text-orange-900">
                  Level {gameConfig.difficulty_level}
                  <span className="text-sm ml-1">
                    {'★'.repeat(gameConfig.difficulty_level)}
                  </span>
                </div>
              </div>
            )}

            {/* Visual Elements */}
            {gameConfig.visual_elements && (
              <div className="col-span-2 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                <div className="text-xs text-blue-600 font-medium mb-2">Visual Elements</div>
                <div className="flex flex-wrap gap-2">
                  {gameConfig.visual_elements.map((element, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium"
                    >
                      {element}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Cues */}
            {gameConfig.audio_cues && (
              <div className="col-span-2 bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-lg p-4">
                <div className="text-xs text-green-600 font-medium mb-2">Audio Cues</div>
                <div className="flex flex-wrap gap-2">
                  {gameConfig.audio_cues.map((cue, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium"
                    >
                      🔊 {cue}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reward System */}
            {gameConfig.reward_system && (
              <div className="col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                <div className="text-xs text-amber-600 font-medium mb-2">Reward System</div>
                <div className="text-sm text-amber-900">{gameConfig.reward_system}</div>
              </div>
            )}
          </div>

          {/* Full Config JSON */}
          <details className="mt-4">
            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900 font-medium">
              전체 Config JSON 보기
            </summary>
            <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <pre className="text-xs whitespace-pre-wrap font-mono text-gray-700">
                {JSON.stringify(gameConfig, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}

      {/* Placeholder when no response */}
      {!apiResponse && !error && !isLoading && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Sparkles size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">Generate 버튼을 눌러 시작하세요</p>
          <p className="text-sm text-gray-500 mt-1">
            AI가 생성한 시나리오와 게임 설정을 확인할 수 있습니다
          </p>
        </div>
      )}
    </div>
  )
}

export default RightPanel
