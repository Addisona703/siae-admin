<template>
    <canvas ref="canvasRef" class="matrix-background"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let animationId = null

onMounted(() => {
    if (!canvasRef.value) return

    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Matrix rain effect
    const fontSize = 16
    const columns = Math.floor(canvas.width / fontSize)
    const drops = []

    // Initialize drops
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100
    }

    // Matrix characters
    const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
    const chars = matrixChars.split('')

    const draw = () => {
        if (!ctx || !canvas) return

        // Semi-transparent black to create trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Set text style
        ctx.fillStyle = '#00ff41'
        ctx.font = `${fontSize}px monospace`

        // Draw characters
        for (let i = 0; i < drops.length; i++) {
            // Random character
            const char = chars[Math.floor(Math.random() * chars.length)]
            if (!char) continue

            const x = i * fontSize
            const dropValue = drops[i]
            if (dropValue === undefined) continue

            const y = dropValue * fontSize

            // Brighter at the head
            if (dropValue * fontSize > 0 && dropValue * fontSize < canvas.height) {
                ctx.fillStyle = '#00ff41'
                ctx.fillText(char, x, y)

                // Dimmer trail
                ctx.fillStyle = 'rgba(0, 255, 65, 0.5)'
                ctx.fillText(char, x, y - fontSize)

                ctx.fillStyle = 'rgba(0, 255, 65, 0.3)'
                ctx.fillText(char, x, y - fontSize * 2)
            }

            // Reset drop to top randomly
            if (dropValue * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0
            } else {
                drops[i] = dropValue + 1
            }
        }

        animationId = requestAnimationFrame(draw)
    }

    draw()
})

onUnmounted(() => {
    if (animationId !== null) {
        cancelAnimationFrame(animationId)
    }
})
</script>

<style scoped lang="less">
.matrix-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background: #000000;
}
</style>
