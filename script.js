// DOM 요소들
const apiKeyInput = document.getElementById('apiKey');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const modelSelect = document.getElementById('modelSelect');
const systemPrompt = document.getElementById('systemPrompt');
const userInput = document.getElementById('userInput');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnLoading = document.getElementById('btnLoading');
const resultDiv = document.getElementById('result');
const copyBtn = document.getElementById('copyBtn');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');
const closeModal = document.querySelector('.close');

// 후처리 옵션 요소들
const postprocessHeader = document.getElementById('postprocessHeader');
const postprocessOptions = document.getElementById('postprocessOptions');
const toggleIcon = postprocessHeader.querySelector('.toggle-icon');
const removeEmojisCheckbox = document.getElementById('removeEmojis');
const removeMarkdownCheckbox = document.getElementById('removeMarkdown');
const extractCodeBlocksCheckbox = document.getElementById('extractCodeBlocks');
const removeExtraSpacesCheckbox = document.getElementById('removeExtraSpaces');

// 템플릿 변수 요소들
const variablesSection = document.getElementById('variablesSection');
const variableInputsContainer = document.getElementById('variableInputs');
const variableCount = document.getElementById('variableCount');

// 상태 관리
let apiKey = localStorage.getItem('geminiApiKey') || '';
let selectedModel = localStorage.getItem('selectedModel') || '';
let originalResultText = ''; // 원본 결과 저장
let templateVariables = {}; // 템플릿 변수 값 저장

// Gemini API 사용 가능한 모델 목록
const availableModels = [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' }
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
    systemPrompt.disabled = false;
    userInput.disabled = false;
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

// 후처리 함수들
function removeEmojis(text) {
    // 이모지 정규식 (대부분의 이모지 매칭)
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu, '');
}

function removeMarkdown(text) {
    return text
        // 코드 블록 제거 (```...```)
        .replace(/```[\s\S]*?```/g, '')
        // 인라인 코드 제거 (`...`)
        .replace(/`([^`]+)`/g, '$1')
        // 굵은 글씨 (**, __)
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        // 기울임 (*, _)
        .replace(/(\*|_)(.*?)\1/g, '$2')
        // 제목 (#, ##, ###)
        .replace(/^#{1,6}\s+/gm, '')
        // 리스트 (-, *, +)
        .replace(/^[\s]*[-*+]\s+/gm, '')
        // 링크 [text](url)
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        // 이미지 ![alt](url)
        .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1')
        // 인용 (>)
        .replace(/^>\s+/gm, '')
        // 수평선 (---, ***)
        .replace(/^[-*_]{3,}$/gm, '');
}

function extractCodeBlocks(text) {
    const codeBlocks = [];
    const regex = /```[\s\S]*?```|`[^`]+`/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        let code = match[0];
        // ``` 제거
        code = code.replace(/^```[\w]*\n?/, '').replace(/```$/, '');
        // ` 제거
        code = code.replace(/^`/, '').replace(/`$/, '');
        codeBlocks.push(code.trim());
    }

    return codeBlocks.length > 0 ? codeBlocks.join('\n\n---\n\n') : text;
}

function removeExtraSpaces(text) {
    return text
        // 여러 공백을 하나로
        .replace(/ +/g, ' ')
        // 여러 줄바꿈을 하나로
        .replace(/\n{3,}/g, '\n\n')
        // 줄 앞뒤 공백 제거
        .replace(/^ +| +$/gm, '');
}

// 후처리 적용
function applyPostProcessing(text) {
    let processed = text;

    if (extractCodeBlocksCheckbox.checked) {
        processed = extractCodeBlocks(processed);
    }

    if (removeMarkdownCheckbox.checked) {
        processed = removeMarkdown(processed);
    }

    if (removeEmojisCheckbox.checked) {
        processed = removeEmojis(processed);
    }

    if (removeExtraSpacesCheckbox.checked) {
        processed = removeExtraSpaces(processed);
    }

    return processed;
}

// 결과 업데이트 (후처리 적용)
function updateResult() {
    if (!originalResultText) return;

    const processedText = applyPostProcessing(originalResultText);
    resultDiv.innerHTML = '';
    resultDiv.textContent = processedText;
    resultDiv.classList.add('has-content');
}

// 템플릿 변수 추출 함수
function extractTemplateVariables(text) {
    const regex = /\$\{(\w+)\}/g;
    const variables = new Set();
    let match;

    while ((match = regex.exec(text)) !== null) {
        variables.add(match[1]);
    }

    return Array.from(variables);
}

// 템플릿 변수 입력 필드 생성
function updateVariableInputs() {
    const promptText = systemPrompt.value;
    const variables = extractTemplateVariables(promptText);

    if (variables.length === 0) {
        variablesSection.style.display = 'none';
        return;
    }

    // 섹션 표시
    variablesSection.style.display = 'block';
    variableCount.textContent = `${variables.length}개`;

    // 기존 입력 필드 저장
    const currentValues = { ...templateVariables };

    // 입력 필드 생성
    variableInputsContainer.innerHTML = '';
    variables.forEach(varName => {
        const group = document.createElement('div');
        group.className = 'variable-input-group';

        const label = document.createElement('label');
        label.textContent = `${varName}:`;
        label.setAttribute('for', `var-${varName}`);

        const input = document.createElement('input');
        input.type = 'text';
        input.id = `var-${varName}`;
        input.placeholder = `${varName} 값을 입력하세요`;
        input.value = currentValues[varName] || '';

        input.addEventListener('input', (e) => {
            templateVariables[varName] = e.target.value;
        });

        group.appendChild(label);
        group.appendChild(input);
        variableInputsContainer.appendChild(group);

        // 초기값 저장
        templateVariables[varName] = input.value;
    });
}

// 템플릿 변수 치환
function replaceTemplateVariables(text) {
    let result = text;

    for (const [varName, value] of Object.entries(templateVariables)) {
        const regex = new RegExp(`\\$\\{${varName}\\}`, 'g');
        result = result.replace(regex, value);
    }

    return result;
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
    let system = systemPrompt.value.trim();
    const user = userInput.value.trim();

    if (!apiKey) {
        showError('먼저 API Key를 입력하고 저장해주세요.');
        return;
    }

    if (!selectedModel) {
        showError('모델을 선택해주세요.');
        return;
    }

    if (!user) {
        showError('사용자 입력을 입력해주세요.');
        return;
    }

    // 템플릿 변수 치환
    if (system) {
        system = replaceTemplateVariables(system);
    }

    // 시스템 프롬프트와 사용자 입력 결합
    const fullPrompt = system ? `${system}\n\n${user}` : user;

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
                            text: fullPrompt
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
            originalResultText = text; // 원본 저장

            const processedText = applyPostProcessing(text);
            resultDiv.innerHTML = '';
            resultDiv.textContent = processedText;
            resultDiv.classList.add('has-content');
            copyBtn.style.display = 'inline-block';
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

        originalResultText = ''; // 원본 초기화
        resultDiv.innerHTML = '<p class="placeholder">오류가 발생했습니다.</p>';
        copyBtn.style.display = 'none';
    } finally {
        // UI 상태 복구
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
});

// Enter 키로 전송 (Shift+Enter는 줄바꿈)
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitBtn.click();
    }
});

// 복사하기 버튼
copyBtn.addEventListener('click', async () => {
    const text = resultDiv.textContent;

    try {
        await navigator.clipboard.writeText(text);

        // 버튼 텍스트 임시 변경
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ 복사됨!';
        copyBtn.style.background = '#047857';

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '#10b981';
        }, 2000);
    } catch (error) {
        showError('복사에 실패했습니다: ' + error.message);
    }
});

// 시스템 프롬프트 입력 시 템플릿 변수 추출
systemPrompt.addEventListener('input', updateVariableInputs);

// 후처리 옵션 토글
postprocessHeader.addEventListener('click', () => {
    postprocessOptions.classList.toggle('collapsed');
    toggleIcon.classList.toggle('collapsed');
});

// 후처리 옵션 변경시 결과 업데이트
removeEmojisCheckbox.addEventListener('change', updateResult);
removeMarkdownCheckbox.addEventListener('change', updateResult);
extractCodeBlocksCheckbox.addEventListener('change', updateResult);
removeExtraSpacesCheckbox.addEventListener('change', updateResult);

// 모달 닫기 이벤트
closeModal.addEventListener('click', closeErrorModal);
window.addEventListener('click', (e) => {
    if (e.target === errorModal) {
        closeErrorModal();
    }
});

// 초기화 실행
init();
