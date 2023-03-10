import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval;
let isShifting;
let isCtrling;
let isFast = true;

function loader(el) {
    el.textContent = ''

    loadInterval = setInterval(() => {
        el.textContent += '.'

        if (el.textContent === '....') {
            el.textContent = ''
        }
    }, 300)
}

function typeText(el, txt, i) {
    let index = 0;

    let interval = setInterval(() => {
        if (index < txt.length) {
            el.innerHTML += txt.charAt(index)
            index++
        } else clearInterval(interval)
    }, i)
}

function genUId() {
    const timestamp = Date.now()
    const randomNumber = Math.random()
    const hexStr = randomNumber.toString(16)

    return `id-${timestamp}-${hexStr}`
}

function chatStripe(isAi, value, uid) {
    return (
        `
            <div class="wrapper ${isAi && 'ai'}">
                <div class="chat">
                    <div class="profile">
                        <p>${isAi ? '>' : '!'}</p>
                    </div>
                    <div class="message" id=${uid}>${value}</div>
                </div>
            </div>
        `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)

    // user
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
    form.reset()

    // bot
    const uid = genUId()
    chatContainer.innerHTML += chatStripe(true, " ", uid)
    chatContainer.scrollTop = chatContainer.scrollHeight

    const messageDiv = document.getElementById(uid)
    loader(messageDiv)

    // fetch data
    const response = await fetch('https://jubilant.onrender.com/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = ''

    if (response.ok) {
        const data = await response.json()
        const parsedData = data.bot.trim()
        
        isFast ? typeText(messageDiv, parsedData, 0) : typeText(messageDiv, parsedData, 20)
    } else {
        const error = await response.text()

        messageDiv.innerHTML = "Response error: check console"
        console.log(error)
    }
}

form.addEventListener('keydown', (e) => {
    if (e.keyCode === 16) {
        isShifting = true
        console.log(`shift: ${isShifting}`)
    }
})

form.addEventListener('keyup', (e) => {
    if (e.keyCode === 16) {
        isShifting = false
        console.log(`shift: ${isShifting}`)
    }
})

form.addEventListener('keydown', (e) => {
    if (e.keyCode === 17) {
        isCtrling = true
        console.log(`ctrl: ${isCtrling}`)
    }
})

form.addEventListener('keyup', (e) => {
    if (e.keyCode === 17) {
        isCtrling = false
        console.log(`ctrl: ${isCtrling}`)
    }
})

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13 && !isShifting) handleSubmit(e)
})

form.addEventListener('keydown', (e) => {
    if (e.keyCode === 188 && isCtrling) isFast = true
})

form.addEventListener('keydown', (e) => {
    if (e.keyCode === 190 && isCtrling) isFast = false
})