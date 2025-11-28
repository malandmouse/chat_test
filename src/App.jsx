import { useState, useEffect } from 'react'
import LeftPanel from './components/LeftPanel'
import MiddlePanel from './components/MiddlePanel'
import RightPanel from './components/RightPanel'

// Default Person A data
const DEFAULT_DATA = {
  profile: {
    name: "김민준",
    age: 6,
    diagnosis: "자폐 스펙트럼 장애 (Level 2)",
    interests: ["공룡", "기차", "블록 쌓기"],
    sensory_preferences: {
      visual: "선명한 색상 선호",
      auditory: "갑작스러운 소리에 민감",
      tactile: "부드러운 촉감 선호"
    }
  },
  current_skills: {
    emotion_recognition: "기본 표정 4가지(기쁨, 슬픔, 화남, 놀람) 인식 가능",
    social_interaction: "또래와의 상호작용 어려움, 1:1 상황 선호",
    communication: "2-3단어 문장 사용, 반향어 있음"
  },
  treatment_goals: {
    primary: "감정 인식 및 표현 능력 향상",
    secondary: "사회적 상호작용 기술 발달",
    target_emotions: ["기쁨", "슬픔", "화남", "놀람", "두려움"]
  }
}

const DEFAULT_CONVERSION_TEMPLATE = `아동 정보:
- 이름: {profile.name}
- 나이: {profile.age}세
- 진단: {profile.diagnosis}
- 관심사: {profile.interests}
- 현재 기술: {current_skills.emotion_recognition}
- 치료 목표: {treatment_goals.primary}
- 목표 감정: {treatment_goals.target_emotions}`

const DEFAULT_SYSTEM_PROMPT = `# Role
당신은 자폐 스펙트럼 아동을 위한 사회성 치료 시나리오 작가입니다.

# Guidelines
1. 아동의 발달 수준에 맞는 간단하고 명확한 시나리오를 작성하세요
2. 아동의 관심사를 활용하여 동기를 유발하세요
3. 감각 특성을 고려한 시각적/청각적 요소를 설계하세요
4. 단계적으로 난이도를 조절할 수 있는 게임 구성을 제안하세요

# Output Format
반드시 JSON 형식으로 응답하며, 다음 구조를 따르세요:
{
  "scenario": {
    "title": "시나리오 제목",
    "description": "시나리오 설명",
    "target_skill": "목표 기술"
  },
  "game_config": {
    "target_emotion": "목표 감정",
    "difficulty_level": 1-5,
    "visual_elements": ["요소1", "요소2"],
    "audio_cues": ["큐1", "큐2"],
    "reward_system": "보상 시스템 설명"
  },
  "interaction_flow": [
    "단계별 상호작용 흐름"
  ]
}`

function App() {
  const [apiKey, setApiKey] = useState('')
  const [dataObject, setDataObject] = useState(JSON.stringify(DEFAULT_DATA, null, 2))
  const [conversionTemplate, setConversionTemplate] = useState(DEFAULT_CONVERSION_TEMPLATE)
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [finalPrompt, setFinalPrompt] = useState('')
  const [apiResponse, setApiResponse] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key')
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  // Save API key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('openai_api_key', apiKey)
    }
  }, [apiKey])

  // Generate final prompt in real-time
  useEffect(() => {
    try {
      const data = JSON.parse(dataObject)
      let converted = conversionTemplate

      // Simple template replacement
      const replacements = {
        '{profile.name}': data.profile?.name || '',
        '{profile.age}': data.profile?.age || '',
        '{profile.diagnosis}': data.profile?.diagnosis || '',
        '{profile.interests}': Array.isArray(data.profile?.interests)
          ? data.profile.interests.join(', ')
          : '',
        '{current_skills.emotion_recognition}': data.current_skills?.emotion_recognition || '',
        '{treatment_goals.primary}': data.treatment_goals?.primary || '',
        '{treatment_goals.target_emotions}': Array.isArray(data.treatment_goals?.target_emotions)
          ? data.treatment_goals.target_emotions.join(', ')
          : ''
      }

      Object.entries(replacements).forEach(([key, value]) => {
        converted = converted.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value)
      })

      const final = `${systemPrompt}\n\n---\n\n${converted}`
      setFinalPrompt(final)
    } catch (err) {
      // Invalid JSON, don't update
    }
  }, [dataObject, conversionTemplate, systemPrompt])

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('OpenAI API Key를 먼저 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: finalPrompt
            }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || `API Error: ${response.status}`)
      }

      const data = await response.json()
      setApiResponse(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            🎮 Interactive Prompt Playground
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            자폐 아동 맞춤형 시나리오 생성 시스템 검증 도구
          </p>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LeftPanel
            apiKey={apiKey}
            setApiKey={setApiKey}
            dataObject={dataObject}
            setDataObject={setDataObject}
            conversionTemplate={conversionTemplate}
            setConversionTemplate={setConversionTemplate}
          />

          <MiddlePanel
            systemPrompt={systemPrompt}
            setSystemPrompt={setSystemPrompt}
            finalPrompt={finalPrompt}
          />

          <RightPanel
            apiResponse={apiResponse}
            isLoading={isLoading}
            error={error}
            onGenerate={handleGenerate}
          />
        </div>
      </main>
    </div>
  )
}

export default App
