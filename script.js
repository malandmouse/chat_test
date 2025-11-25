// DOM 요소들
const apiKeyInput = document.getElementById('apiKey');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const modelSelect = document.getElementById('modelSelect');
const promptInput = document.getElementById('promptInput');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnLoading = document.getElementById('btnLoading');
const resultDiv = document.getElementById('result');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');
const closeModal = document.querySelector('.close');

// 상태 관리
let apiKey = localStorage.getItem('geminiApiKey') || '';
let selectedModel = localStorage.getItem('selectedModel') || '';

// Gemini API 사용 가능한 모델 목록
const availableModels = [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro' }
];

// 초기화
function init() {
    if (apiKey) {
        apiKeyInput.value = apiKey;
        enableModelSelection();
    }

    // 모델 선택 박스 채우기
    populateModelSelect();

    if (selectedModel) {
        modelSelect.value = selectedModel;
    }
}

// 모델 선택 박스 채우기
function populateModelSelect() {
    modelSelect.innerHTML = '<option value="">모델을 선택하세요</option>';
    availableModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.name;
        modelSelect.appendChild(option);
    });
}

// 모델 선택 활성화
function enableModelSelection() {
    modelSelect.disabled = false;
    promptInput.disabled = false;
    submitBtn.disabled = false;
}

// 에러 모달 표시
function showError(message) {
    errorMessage.textContent = message;
    errorModal.style.display = 'block';
}

// 에러 모달 닫기
function closeErrorModal() {
    errorModal.style.display = 'none';
}

// API Key 저장
saveApiKeyBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();

    if (!key) {
        showError('API Key를 입력해주세요.');
        return;
    }

    // API Key 유효성 검사
    try {
        saveApiKeyBtn.disabled = true;
        saveApiKeyBtn.textContent = '확인 중...';

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
        );

        if (!response.ok) {
            throw new Error('유효하지 않은 API Key입니다.');
        }

        apiKey = key;
        localStorage.setItem('geminiApiKey', key);
        enableModelSelection();

        showError('✅ API Key가 저장되었습니다!');
    } catch (error) {
        showError(`API Key 검증 실패: ${error.message}`);
    } finally {
        saveApiKeyBtn.disabled = false;
        saveApiKeyBtn.textContent = '저장';
    }
});

// 모델 선택 변경
modelSelect.addEventListener('change', (e) => {
    selectedModel = e.target.value;
    localStorage.setItem('selectedModel', selectedModel);
});

// 프롬프트 전송
submitBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();

    if (!apiKey) {
        showError('먼저 API Key를 입력하고 저장해주세요.');
        return;
    }

    if (!selectedModel) {
        showError('모델을 선택해주세요.');
        return;
    }

    if (!prompt) {
        showError('프롬프트를 입력해주세요.');
        return;
    }

    try {
        // UI 상태 변경
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';
        resultDiv.innerHTML = '<p class="placeholder">응답을 기다리는 중...</p>';

        // API 호출
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API 오류: ${response.status}`);
        }

        const data = await response.json();

        // 결과 표시
        if (data.candidates && data.candidates.length > 0) {
            const text = data.candidates[0].content.parts[0].text;
            resultDiv.innerHTML = '';
            resultDiv.textContent = text;
            resultDiv.classList.add('has-content');
        } else {
            throw new Error('응답을 받지 못했습니다.');
        }

    } catch (error) {
        // 에러 처리
        if (error.name === 'AbortError') {
            showError('요청이 중단되었습니다.');
        } else {
            showError(`오류 발생: ${error.message}`);
        }

        resultDiv.innerHTML = '<p class="placeholder">오류가 발생했습니다.</p>';
    } finally {
        // UI 상태 복구
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
});

// Enter 키로 전송 (Shift+Enter는 줄바꿈)
promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitBtn.click();
    }
});

// 모달 닫기 이벤트
closeModal.addEventListener('click', closeErrorModal);
window.addEventListener('click', (e) => {
    if (e.target === errorModal) {
        closeErrorModal();
    }
});

// 초기화 실행
init();
