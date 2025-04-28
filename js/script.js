const container = document.querySelector('.container')
const face = document.querySelector('.face-slider')
const btnHappy = document.querySelector('.button-happy')
const btnUnhappy = document.querySelector('.button-unhappy')
const title = document.querySelector('.title')
const subtitle = document.querySelector('.subtitle')

const config = {
    maxUnhappyCount: 1,
    animationSpeed: 0.1,
    states: {
        normal: {
            face: { happiness: 0.9, derp: 1, px: 0.5, py: 0.5 },
            ui: {
                btnHappyText: btnHappy.innerHTML,
                btnUnhappyText: btnUnhappy.innerHTML,
                titleText: title.innerHTML,
                subtitleText: subtitle.innerHTML
            }
        },
        happy: {
            face: { happiness: 1, derp: 0, px: 0.5, py: 0.5 },
            ui: {
                btnHappyText: '返回',
                titleText: '喜欢',
                subtitleText: '俺也喜欢你'
            }
        },
        unhappy: {
            face: { happiness: 0.2, derp: 0, px: 0.5, py: 0.5 },
            ui: {
                btnUnhappyText: '返回',
                titleText: '已删除',
                subtitleText: '感谢您使用本插件'
            }
        }
    }
}

const state = {
    rejectCount: 0,
    animationId: null,
    current: { ...config.states.normal.face },
    target: { ...config.states.normal.face }
}

function updateFaceCSS() {
    Object.entries(state.current).forEach(([prop, value]) => {
        face.style.setProperty(`--${prop}`, value)
    })
}

function transitionToState(stateType, hideButton = null) {
    const targetState = config.states[stateType]

    if (targetState.face) {
        Object.assign(state.current, targetState.face)
    }

    if (targetState.ui) {
        const { btnHappyText, btnUnhappyText, titleText, subtitleText } = targetState.ui

        if (btnHappyText) btnHappy.innerHTML = btnHappyText
        if (btnUnhappyText) btnUnhappy.innerHTML = btnUnhappyText
        if (titleText) title.innerHTML = titleText
        if (subtitleText) subtitle.innerHTML = subtitleText
    }

    if (hideButton) {
        hideButton.style.visibility = 'hidden'
    } else {
        btnHappy.style.visibility = 'visible'
        btnUnhappy.style.visibility = 'visible'
        btnUnhappy.style.position = 'static'
        btnUnhappy.style.left = ''
        btnUnhappy.style.top = ''
        btnHappy.style.transform = 'scale(1)'
    }
    updateFaceCSS()
}

function stopAnimation() {
    if (state.animationId) {
        cancelAnimationFrame(state.animationId)
        state.animationId = null
    }
}

function startAnimation() {
    function updateFace() {
        let needsUpdate = false

        for (const prop in state.target) {
            if (state.target[prop] === state.current[prop]) continue

            needsUpdate = true
            if (Math.abs(state.target[prop] - state.current[prop]) < 0.01) {
                state.current[prop] = state.target[prop]
            } else {
                state.current[prop] += (state.target[prop] - state.current[prop]) * config.animationSpeed
            }
        }

        if (needsUpdate) {
            updateFaceCSS()
        }

        state.animationId = requestAnimationFrame(updateFace)
    }

    updateFace()
}

container.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
    const unhappyRect = btnUnhappy.getBoundingClientRect()
    const happyRect = btnHappy.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    const dx1 = x - (unhappyRect.x + unhappyRect.width * 0.5)
    const dy1 = y - (unhappyRect.y + unhappyRect.height * 0.5)
    const dx2 = x - (happyRect.x + happyRect.width * 0.5)
    const dy2 = y - (happyRect.y + happyRect.height * 0.5)

    const px = (x - containerRect.x) / containerRect.width
    const py = (y - containerRect.y) / containerRect.height

    const distUnhappy = Math.sqrt(dx1 * dx1 + dy1 * dy1)
    const distHappy = Math.sqrt(dx2 * dx2 + dy2 * dy2)
    const happiness = Math.pow(distUnhappy / (distHappy + distUnhappy), 0.75)

    state.target = { ...state.target, happiness, derp: 0, px, py }
})

container.addEventListener('mouseleave', () => {
    state.target = { ...config.states.normal.face }
})

// 修改后的 btnUnhappy 点击事件处理
btnUnhappy.addEventListener('click', () => {
    stopAnimation()
    state.rejectCount = 0  // 重置拒绝计数器
    // 恢复到正常状态并重置所有UI元素
    transitionToState('normal')
    // 立即重置面部表情到初始状态
    Object.assign(state.current, config.states.normal.face)
    updateFaceCSS()
    // 重新开始动画
    startAnimation()
})

// 修改后的 btnHappy 点击事件处理保持不变
btnHappy.addEventListener('click', () => {
    if (state.animationId) {
        btnHappy.style.transform = 'scale(1)'
        stopAnimation()
        transitionToState('happy', btnUnhappy)
    } else {
        state.rejectCount = 0
        transitionToState('normal')
        startAnimation()
    }
})
startAnimation()
