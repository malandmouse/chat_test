// ============================================
// DOM 요소
// ============================================
// API 설정
const apiKeyInput = document.getElementById('apiKey');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const modelSelect = document.getElementById('modelSelect');

// 변수 관리
const addVariableBtn = document.getElementById('addVariableBtn');
const variablesList = document.getElementById('variablesList');

// 모델 파라미터
const temperatureSlider = document.getElementById('temperature');
const tempValue = document.getElementById('tempValue');
const maxTokensInput = document.getElementById('maxTokens');
const jsonModeCheckbox = document.getElementById('jsonMode');

// 프롬프트 입력
const systemPrompt = document.getElementById('systemPrompt');
const userInput = document.getElementById('userInput');
const previewBtn = document.getElementById('previewBtn');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnLoading = document.getElementById('btnLoading');

// Preview
const previewSection = document.getElementById('previewSection');
const previewContent = document.getElementById('previewContent');
const togglePreview = document.getElementById('togglePreview');

// 후처리
const postprocessHeader = document.getElementById('postprocessHeader');
const postprocessOptions = document.getElementById('postprocessOptions');
const toggleIcon = postprocessHeader.querySelector('.toggle-icon');
const removeEmojisCheckbox = document.getElementById('removeEmojis');
const removeMarkdownCheckbox = document.getElementById('removeMarkdown');
const extractCodeBlocksCheckbox = document.getElementById('extractCodeBlocks');
const removeExtraSpacesCheckbox = document.getElementById('removeExtraSpaces');

// 결과
const resultDiv = document.getElementById('result');
const copyBtn = document.getElementById('copyBtn');

// 성능 메트릭
const performanceMetrics = document.getElementById('performanceMetrics');
const latencyValue = document.getElementById('latencyValue');
const inputTokens = document.getElementById('inputTokens');
const outputTokens = document.getElementById('outputTokens');
const parsingStatus = document.getElementById('parsingStatus');

// 출력 비교
const outputComparison = document.getElementById('outputComparison');
const rawOutput = document.getElementById('rawOutput');
const processedOutput = document.getElementById('processedOutput');

// 모달
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');
const closeModal = document.querySelector('.close');

// ============================================
// 상태 관리
// ============================================
let apiKey = localStorage.getItem('geminiApiKey') || '';
let selectedModel = localStorage.getItem('selectedModel') || '';
let variables = []; // { id, key, value }
let variableIdCounter = 0;
let originalResultText = '';

// Gemini API 사용 가능한 모델 목록
const availableModels = [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' }
];

// ============================================
// 초기화
// ============================================
function init() {
    if (apiKey) {
        apiKeyInput.value = apiKey;
        enableInputs();
    }

    populateModelSelect();

    if (selectedModel) {
        modelSelect.value = selectedModel;
    }

    // 저장된 변수 로드 또는 기본 예시 변수 추가
    const loaded = loadVariablesFromStorage();
    if (loaded && variables.length > 0) {
        // 저장된 변수들을 UI에 렌더링
        variables.forEach(({ id, key, value }) => {
            const item = document.createElement('div');
            item.className = 'variable-item';
            item.dataset.id = id;

            item.innerHTML = `
                <div class="variable-item-header">
                    <small>변수 #${id + 1}</small>
                    <button class="btn btn-delete" onclick="removeVariable(${id})">삭제</button>
                </div>
                <div class="variable-inputs-pair">
                    <input type="text" placeholder="Key (예: childName)" value="${key}"
                           oninput="updateVariableKey(${id}, this.value)">
                    <input type="text" placeholder="Value (예: 민수)" value="${value}"
                           oninput="updateVariableValue(${id}, this.value)">
                </div>
            `;

            variablesList.appendChild(item);
        });
    } else {
        // 저장된 변수가 없으면 기본 예시 변수 추가
        addVariable('childName', '민수');
        addVariable('subject', '수학');
        addVariable('score', '85');
    }
}

// ============================================
// 모델 선택
// ============================================
function populateModelSelect() {
    modelSelect.innerHTML = '<option value="">모델을 선택하세요</option>';
    availableModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.name;
        modelSelect.appendChild(option);
    });
}

function enableInputs() {
    modelSelect.disabled = false;
    systemPrompt.disabled = false;
    userInput.disabled = false;
    previewBtn.disabled = false;
    submitBtn.disabled = false;
}

// ============================================
// 에러 처리
// ============================================
function showError(message) {
    errorMessage.textContent = message;
    errorModal.style.display = 'block';
}

function closeErrorModal() {
    errorModal.style.display = 'none';
}

// ============================================
// 변수 관리
// ============================================
function saveVariablesToStorage() {
    localStorage.setItem('promptVariables', JSON.stringify(variables));
}

function loadVariablesFromStorage() {
    const saved = localStorage.getItem('promptVariables');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            variables = loaded;
            // variableIdCounter 업데이트
            if (variables.length > 0) {
                variableIdCounter = Math.max(...variables.map(v => v.id)) + 1;
            }
            return true;
        } catch (e) {
            console.error('Failed to load variables from storage:', e);
            return false;
        }
    }
    return false;
}

function addVariable(key = '', value = '') {
    const id = variableIdCounter++;
    variables.push({ id, key, value });

    const item = document.createElement('div');
    item.className = 'variable-item';
    item.dataset.id = id;

    item.innerHTML = `
        <div class="variable-item-header">
            <small>변수 #${id + 1}</small>
            <button class="btn btn-delete" onclick="removeVariable(${id})">삭제</button>
        </div>
        <div class="variable-inputs-pair">
            <input type="text" placeholder="Key (예: childName)" value="${key}"
                   oninput="updateVariableKey(${id}, this.value)">
            <input type="text" placeholder="Value (예: 민수)" value="${value}"
                   oninput="updateVariableValue(${id}, this.value)">
        </div>
    `;

    variablesList.appendChild(item);
    saveVariablesToStorage();
}

function removeVariable(id) {
    variables = variables.filter(v => v.id !== id);
    const item = variablesList.querySelector(`[data-id="${id}"]`);
    if (item) {
        item.remove();
    }
    saveVariablesToStorage();
}

function updateVariableKey(id, key) {
    const variable = variables.find(v => v.id === id);
    if (variable) {
        variable.key = key;
        saveVariablesToStorage();
    }
}

function updateVariableValue(id, value) {
    const variable = variables.find(v => v.id === id);
    if (variable) {
        variable.value = value;
        saveVariablesToStorage();
    }
}

function replaceVariables(text) {
    let result = text;

    variables.forEach(({ key, value }) => {
        if (key) {
            const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
            result = result.replace(regex, value);
        }
    });

    return result;
}

// ============================================
// 후처리 함수
// ============================================
function tryParseJSON(text) {
    try {
        // 마크다운 코드 블록 제거
        let cleaned = text.trim();

        // ```json ... ``` 형식 제거
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```$/gm, '');
        // ``` ... ``` 형식 제거
        cleaned = cleaned.replace(/^```\s*/, '').replace(/```$/gm, '');

        cleaned = cleaned.trim();

        // JSON 파싱 시도
        const parsed = JSON.parse(cleaned);
        return { success: true, data: parsed, cleaned };
    } catch (e) {
        return { success: false, error: e.message, text };
    }
}

function removeEmojis(text) {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu, '');
}

function removeMarkdown(text) {
    return text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^[\s]*[-*+]\s+/gm, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1')
        .replace(/^>\s+/gm, '')
        .replace(/^[-*_]{3,}$/gm, '');
}

function extractCodeBlocks(text) {
    const codeBlocks = [];
    const regex = /```[\s\S]*?```|`[^`]+`/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        let code = match[0];
        code = code.replace(/^```[\w]*\n?/, '').replace(/```$/, '');
        code = code.replace(/^`/, '').replace(/`$/, '');
        codeBlocks.push(code.trim());
    }

    return codeBlocks.length > 0 ? codeBlocks.join('\n\n---\n\n') : text;
}

function removeExtraSpaces(text) {
    return text
        .replace(/ +/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^ +| +$/gm, '');
}

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

function updateResult() {
    if (!originalResultText) return;

    const processedText = applyPostProcessing(originalResultText);
    resultDiv.innerHTML = '';
    resultDiv.textContent = processedText;
    resultDiv.classList.add('has-content');
}

// ============================================
// 최종 프롬프트 생성
// ============================================
function buildFinalPrompt() {
    let system = systemPrompt.value.trim();
    const user = userInput.value.trim();

    // 변수 치환
    if (system) {
        system = replaceVariables(system);
    }

    // JSON 모드 처리
    if (jsonModeCheckbox.checked) {
        const jsonInstruction = '반드시 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.';
        if (system) {
            system += '\n\n' + jsonInstruction;
        } else {
            system = jsonInstruction;
        }
    }

    // 프롬프트 결합
    if (system && user) {
        return `${system}\n\n${user}`;
    } else if (system) {
        return system;
    } else {
        return user;
    }
}

// ============================================
// Preview 기능
// ============================================
function showPreview() {
    const fullPrompt = buildFinalPrompt();

    console.log('=== 최종 프롬프트 (Preview) ===');
    console.log(fullPrompt);
    console.log('================================');

    previewContent.textContent = fullPrompt;
    previewSection.style.display = 'block';
}

function hidePreview() {
    previewSection.style.display = 'none';
}

// ============================================
// API Key 저장
// ============================================
saveApiKeyBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();

    if (!key) {
        showError('API Key를 입력해주세요.');
        return;
    }

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
        enableInputs();

        showError('✅ API Key가 저장되었습니다!');
    } catch (error) {
        showError(`API Key 검증 실패: ${error.message}`);
    } finally {
        saveApiKeyBtn.disabled = false;
        saveApiKeyBtn.textContent = '저장';
    }
});

// ============================================
// 모델 선택
// ============================================
modelSelect.addEventListener('change', (e) => {
    selectedModel = e.target.value;
    localStorage.setItem('selectedModel', selectedModel);
});

// ============================================
// Temperature 슬라이더
// ============================================
temperatureSlider.addEventListener('input', (e) => {
    tempValue.textContent = e.target.value;
});

// ============================================
// Preview 버튼
// ============================================
previewBtn.addEventListener('click', () => {
    if (!systemPrompt.value.trim() && !userInput.value.trim()) {
        showError('프롬프트 또는 추가 입력을 먼저 입력해주세요.');
        return;
    }

    showPreview();
});

togglePreview.addEventListener('click', hidePreview);

// ============================================
// 프롬프트 전송
// ============================================
submitBtn.addEventListener('click', async () => {
    const system = systemPrompt.value.trim();
    const user = userInput.value.trim();

    if (!apiKey) {
        showError('먼저 API Key를 입력하고 저장해주세요.');
        return;
    }

    if (!selectedModel) {
        showError('모델을 선택해주세요.');
        return;
    }

    if (!system && !user) {
        showError('프롬프트 또는 추가 입력을 입력해주세요.');
        return;
    }

    try {
        // 최종 프롬프트 생성
        const fullPrompt = buildFinalPrompt();

        // 콘솔에 최종 프롬프트 출력 (디버깅용)
        console.log('=== 최종 프롬프트 (전송) ===');
        console.log(fullPrompt);
        console.log('==========================');

        // 모델 파라미터
        const temperature = parseFloat(temperatureSlider.value);
        const maxTokens = parseInt(maxTokensInput.value);

        console.log('=== 모델 파라미터 ===');
        console.log('Temperature:', temperature);
        console.log('Max Tokens:', maxTokens);
        console.log('JSON Mode:', jsonModeCheckbox.checked);
        console.log('===================');

        // UI 상태 변경
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';
        resultDiv.innerHTML = '<p class="placeholder">응답을 기다리는 중...</p>';

        // API 호출 (Gemini API는 temperature와 maxOutputTokens 지원)
        const requestBody = {
            contents: [{
                parts: [{
                    text: fullPrompt
                }]
            }],
            generationConfig: {
                temperature: temperature,
                maxOutputTokens: maxTokens
            }
        };

        console.log('=== API 요청 Body ===');
        console.log(JSON.stringify(requestBody, null, 2));
        console.log('===================');

        // 시간 측정 시작
        const startTime = performance.now();

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            }
        );

        // 시간 측정 종료
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API 오류: ${response.status}`);
        }

        const data = await response.json();

        // 결과 표시
        if (data.candidates && data.candidates.length > 0) {
            const text = data.candidates[0].content.parts[0].text;
            originalResultText = text;

            console.log('=== API 응답 (원본) ===');
            console.log(text);
            console.log('=====================');

            // 토큰 카운트 추출
            const inputTokenCount = data.usageMetadata?.promptTokenCount || 0;
            const outputTokenCount = data.usageMetadata?.candidatesTokenCount || 0;

            console.log('=== 성능 메트릭 ===');
            console.log(`Latency: ${latency}ms`);
            console.log(`Input Tokens: ${inputTokenCount}`);
            console.log(`Output Tokens: ${outputTokenCount}`);
            console.log('==================');

            // 후처리 적용
            const processedText = applyPostProcessing(text);

            // JSON 파싱 시도
            const parseResult = tryParseJSON(text);

            console.log('=== JSON 파싱 결과 ===');
            console.log('Success:', parseResult.success);
            if (parseResult.success) {
                console.log('Parsed Data:', parseResult.data);
            } else {
                console.log('Error:', parseResult.error);
            }
            console.log('====================');

            // 성능 메트릭 표시
            performanceMetrics.style.display = 'grid';
            latencyValue.textContent = `${latency}ms`;
            inputTokens.textContent = inputTokenCount.toLocaleString();
            outputTokens.textContent = outputTokenCount.toLocaleString();

            if (parseResult.success) {
                parsingStatus.textContent = '✅ 성공';
                parsingStatus.classList.remove('error');
                parsingStatus.classList.add('success');
            } else {
                parsingStatus.textContent = '❌ 실패';
                parsingStatus.classList.remove('success');
                parsingStatus.classList.add('error');
            }

            // 출력 비교 표시
            outputComparison.style.display = 'grid';
            rawOutput.textContent = text;

            // Processed Output 생성
            let finalProcessed;
            if (parseResult.success) {
                // JSON 파싱 성공 시: stringify 후 후처리 적용
                finalProcessed = applyPostProcessing(JSON.stringify(parseResult.data, null, 2));
            } else {
                // JSON 파싱 실패 시: 기존 후처리 결과 사용
                finalProcessed = processedText;
            }
            processedOutput.textContent = finalProcessed;

            // 기존 결과 박스 숨기기
            resultDiv.style.display = 'none';
            copyBtn.style.display = 'inline-block';
        } else {
            throw new Error('응답을 받지 못했습니다.');
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            showError('요청이 중단되었습니다.');
        } else {
            showError(`오류 발생: ${error.message}`);
        }

        originalResultText = '';

        // 성능 메트릭 및 출력 비교 숨기기
        performanceMetrics.style.display = 'none';
        outputComparison.style.display = 'none';

        // 기존 결과 박스 표시
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<p class="placeholder">오류가 발생했습니다.</p>';
        copyBtn.style.display = 'none';
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
});

// ============================================
// Enter 키로 전송
// ============================================
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitBtn.click();
    }
});

// ============================================
// 복사하기
// ============================================
copyBtn.addEventListener('click', async () => {
    // Processed 출력 복사 (우측 패널)
    const text = processedOutput.textContent || resultDiv.textContent;

    try {
        await navigator.clipboard.writeText(text);

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

// ============================================
// 변수 추가 버튼
// ============================================
addVariableBtn.addEventListener('click', () => {
    addVariable();
});

// ============================================
// 후처리 옵션 토글
// ============================================
postprocessHeader.addEventListener('click', () => {
    postprocessOptions.classList.toggle('collapsed');
    toggleIcon.classList.toggle('collapsed');
});

removeEmojisCheckbox.addEventListener('change', updateResult);
removeMarkdownCheckbox.addEventListener('change', updateResult);
extractCodeBlocksCheckbox.addEventListener('change', updateResult);
removeExtraSpacesCheckbox.addEventListener('change', updateResult);

// ============================================
// 모달 닫기
// ============================================
closeModal.addEventListener('click', closeErrorModal);
window.addEventListener('click', (e) => {
    if (e.target === errorModal) {
        closeErrorModal();
    }
});

// ============================================
// 초기화 실행
// ============================================
init();
