document.addEventListener("DOMContentLoaded", () => {
    const scoreDisplay = document.getElementById("score")
    const width = 28
    let score = 0
    const grid = document.querySelector(".grid")

    // Estado para la supervelocidad de Pac-Man
    let isPoweredUp = false
    let speedTimeoutId = null
    let lastMoveTime = 0

    const layout = [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 3, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 3, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 2, 2, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        4, 4, 4, 4, 4, 4, 0, 0, 0, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 0, 0, 0, 4, 4, 4, 4, 4, 4,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 3, 1,
        1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
        1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
        1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
    ]

    const squares = []

    function createBoard() {
        for (let i = 0; i < layout.length; i++) {
            const square = document.createElement("div")
            square.id = i
            grid.appendChild(square)
            squares.push(square)

            if (layout[i] === 0) squares[i].classList.add("pac-dot")
            if (layout[i] === 1) squares[i].classList.add("wall")
            if (layout[i] === 2) squares[i].classList.add("ghost-lair")
            if (layout[i] === 3) squares[i].classList.add("power-pellet")
        }
    }
    createBoard()

    let pacmanCurrentIndex = 490
    squares[pacmanCurrentIndex].classList.add("pac-man")

    function movePacman(e) {
        const now = Date.now()
        // Cuando tiene supervelocidad permite responder el doble de rápido al pulsar teclas
        const moveInterval = isPoweredUp ? 75 : 150

        if (now - lastMoveTime < moveInterval) return
        lastMoveTime = now

        squares[pacmanCurrentIndex].classList.remove("pac-man", "pac-man-powered")
        
        switch (e.key) {
            case "ArrowLeft":
                if (
                    pacmanCurrentIndex % width !== 0 &&
                    !squares[pacmanCurrentIndex - 1].classList.contains("wall") &&
                    !squares[pacmanCurrentIndex - 1].classList.contains("ghost-lair")
                ) {
                    pacmanCurrentIndex -= 1
                }
                if ((pacmanCurrentIndex - 1) === 363) pacmanCurrentIndex = 391
                break
            case "ArrowUp":
                if (
                    pacmanCurrentIndex - width >= 0 &&
                    !squares[pacmanCurrentIndex - width].classList.contains("wall") &&
                    !squares[pacmanCurrentIndex - width].classList.contains("ghost-lair")
                ) {
                    pacmanCurrentIndex -= width
                }
                break
            case "ArrowRight":
                if (
                    pacmanCurrentIndex % width < width - 1 &&
                    !squares[pacmanCurrentIndex + 1].classList.contains("wall") &&
                    !squares[pacmanCurrentIndex + 1].classList.contains("ghost-lair")
                ) {
                    pacmanCurrentIndex += 1
                }
                if ((pacmanCurrentIndex + 1) === 392) pacmanCurrentIndex = 364
                break
            case "ArrowDown":
                if (
                    pacmanCurrentIndex + width < width * width &&
                    !squares[pacmanCurrentIndex + width].classList.contains("wall") &&
                    !squares[pacmanCurrentIndex + width].classList.contains("ghost-lair")
                ) {
                    pacmanCurrentIndex += width
                }
                break
        }

        squares[pacmanCurrentIndex].classList.add("pac-man")
        if (isPoweredUp) squares[pacmanCurrentIndex].classList.add("pac-man-powered")

        pacDotEaten()
        powerPelletEaten()
        checkForGameOver()
        checkForWin()
    }

    document.addEventListener("keydown", movePacman)

    function pacDotEaten() {
        if (squares[pacmanCurrentIndex].classList.contains("pac-dot")) {
            score++
            scoreDisplay.innerHTML = score
            squares[pacmanCurrentIndex].classList.remove("pac-dot")
        }
    }

    function powerPelletEaten() {
        if (squares[pacmanCurrentIndex].classList.contains("power-pellet")) {
            score += 10
            scoreDisplay.innerHTML = score
            
            // Activar velocidad doble
            isPoweredUp = true
            squares[pacmanCurrentIndex].classList.add("pac-man-powered")
            
            ghosts.forEach(ghost => ghost.isScared = true)
            
            if (speedTimeoutId) clearTimeout(speedTimeoutId)
            speedTimeoutId = setTimeout(unScareGhosts, 10000)
            
            squares[pacmanCurrentIndex].classList.remove("power-pellet")
        }
    }

    function unScareGhosts() {
        ghosts.forEach(ghost => ghost.isScared = false)
        isPoweredUp = false
        squares[pacmanCurrentIndex].classList.remove("pac-man-powered")
    }

    class Ghost {
        constructor(className, startIndex, speed) {
            this.className = className
            this.startIndex = startIndex
            this.speed = speed
            this.currentIndex = startIndex
            this.isScared = false
            this.timerId = NaN
            this.direction = -width
        }
    }

    const ghosts = [
        new Ghost("blinky", 348, 250),
        new Ghost("pinky", 376, 400),
        new Ghost("inky", 351, 300),
        new Ghost("clyde", 379, 500),
    ]

    ghosts.forEach(ghost =>
        squares[ghost.currentIndex].classList.add(ghost.className, "ghost"))

    function getCoordinates(index) {
        return {
            x: index % width,
            y: Math.floor(index / width)
        }
    }

    ghosts.forEach(ghost => moveGhost(ghost))

    function moveGhost(ghost) {
        ghost.timerId = setInterval(function () {
            const possibleDirections = [-1, 1, width, -width]
            
            let validMoves = possibleDirections.filter(dir => {
                const nextIndex = ghost.currentIndex + dir
                const isWall = squares[nextIndex].classList.contains("wall")
                const isOpposite = dir === -ghost.direction
                return !isWall && !isOpposite
            })

            if (validMoves.length === 0) {
                validMoves = possibleDirections.filter(dir => {
                    return !squares[ghost.currentIndex + dir].classList.contains("wall")
                })
            }

            if (validMoves.length > 0) {
                const pacmanCoords = getCoordinates(pacmanCurrentIndex)

                validMoves.sort((a, b) => {
                    const nextA = getCoordinates(ghost.currentIndex + a)
                    const nextB = getCoordinates(ghost.currentIndex + b)

                    const distA = Math.abs(nextA.x - pacmanCoords.x) + Math.abs(nextA.y - pacmanCoords.y)
                    const distB = Math.abs(nextB.x - pacmanCoords.x) + Math.abs(nextB.y - pacmanCoords.y)

                    return ghost.isScared ? distB - distA : distA - distB
                })

                ghost.direction = validMoves[0]
            }

            squares[ghost.currentIndex].classList.remove(ghost.className, "ghost", "scared-ghost")
            ghost.currentIndex += ghost.direction
            squares[ghost.currentIndex].classList.add(ghost.className, "ghost")

            if (ghost.isScared) {
                squares[ghost.currentIndex].classList.add("scared-ghost")
            }

            if (ghost.isScared && squares[ghost.currentIndex].classList.contains("pac-man")) {
                ghost.isScared = false
                squares[ghost.currentIndex].classList.remove(ghost.className, "ghost", "scared-ghost")
                ghost.currentIndex = ghost.startIndex
                score += 100
                scoreDisplay.innerHTML = score
                squares[ghost.currentIndex].classList.add(ghost.className, "ghost")
            }

            checkForGameOver()
        }, ghost.speed)
    }

    function checkForGameOver() {
        if (
            squares[pacmanCurrentIndex].classList.contains("ghost") &&
            !squares[pacmanCurrentIndex].classList.contains("scared-ghost")
        ) {
            ghosts.forEach(ghost => clearInterval(ghost.timerId))
            document.removeEventListener("keydown", movePacman)
            setTimeout(function () {
                alert("Game Over")
            }, 500)
        }
    }

    function checkForWin() {
        if (score >= 274) {
            ghosts.forEach(ghost => clearInterval(ghost.timerId))
            document.removeEventListener("keydown", movePacman)
            setTimeout(function () {
                alert("You have WON!")
            }, 500)
        }
    }
})