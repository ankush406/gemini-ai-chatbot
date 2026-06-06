// ================================
// PARTICLE BACKGROUND
// ================================

const canvas = document.getElementById("particles");

if (canvas) {

    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];

    class Particle {

        constructor() {

            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;

            this.size = Math.random() * 2 + 1;

            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
        }

        update() {

            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width) {
                this.speedX *= -1;
            }

            if (this.y < 0 || this.y > canvas.height) {
                this.speedY *= -1;
            }
        }

        draw() {

            ctx.beginPath();

            ctx.arc(
                this.x,
                this.y,
                this.size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = "rgba(255,255,255,.8)";
            ctx.fill();
        }
    }

    for (let i = 0; i < 90; i++) {
        particles.push(new Particle());
    }

    function connect() {

        for (let a = 0; a < particles.length; a++) {

            for (let b = a; b < particles.length; b++) {

                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;

                const distance = dx * dx + dy * dy;

                if (distance < 14000) {

                    ctx.beginPath();

                    ctx.strokeStyle =
                        "rgba(255,255,255,.06)";

                    ctx.lineWidth = 1;

                    ctx.moveTo(
                        particles[a].x,
                        particles[a].y
                    );

                    ctx.lineTo(
                        particles[b].x,
                        particles[b].y
                    );

                    ctx.stroke();
                }
            }
        }
    }

    function animate() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        particles.forEach(p => {

            p.update();
            p.draw();
        });

        connect();

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener("resize", () => {

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}


// ================================
// CHATBOT
// ================================

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");


// Add Message

function addMessage(text, sender) {

    const div = document.createElement("div");

    div.classList.add("message", sender);
    div.textContent = text;

    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;

    return div;
}


// Thinking Animation

function createThinkingMessage() {

    const div = document.createElement("div");

    div.classList.add("message", "bot");
    div.textContent = "Thinking";

    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;

    let dots = 0;

    const interval = setInterval(() => {

        dots = (dots + 1) % 4;

        div.textContent =
            "Thinking" + ".".repeat(dots);

    }, 400);

    return {
        element: div,
        interval
    };
}


// Typewriter Effect

async function typeMessage(element, text) {

    element.textContent = "";

    for (let i = 0; i < text.length; i++) {

        element.textContent += text.charAt(i);

        chatBox.scrollTop =
            chatBox.scrollHeight;

        await new Promise(resolve =>
            setTimeout(resolve, 15)
        );
    }
}


// Send Message

async function sendMessage() {

    const message =
        userInput.value.trim();

    if (!message) return;

    // Prevent spam clicks

    sendBtn.disabled = true;

    addMessage(message, "user");

    userInput.value = "";

    const thinking =
        createThinkingMessage();

    try {

        const response =
            await fetch("/chat", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message
                })
            });

        if (!response.ok) {
            throw new Error(
                "Server Error"
            );
        }

        const data =
            await response.json();

        clearInterval(
            thinking.interval
        );

        thinking.element.remove();

        const aiReply =
            data.reply ||
            "Sorry, I couldn't generate a response.";

        const botDiv =
            addMessage("", "bot");

        await typeMessage(
            botDiv,
            aiReply
        );

    } catch (error) {

        clearInterval(
            thinking.interval
        );

        thinking.element.remove();

        addMessage(
            "❌ Error connecting to server.",
            "bot"
        );

        console.error(error);

    } finally {

        sendBtn.disabled = false;
    }
}


// Button Click

sendBtn.addEventListener(
    "click",
    sendMessage
);


// Enter Key

userInput.addEventListener(
    "keypress",
    (e) => {

        if (e.key === "Enter") {
            sendMessage();
        }
    }
);