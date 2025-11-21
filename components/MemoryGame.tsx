"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const INITIAL_TIME_SECONDS = 120;

const generateDeck = () => {
  const memoryCards = ["1", "2", "3", "4", "5", "6"];
  const deck = [...memoryCards, ...memoryCards];
  return deck.sort(() => Math.random() - 0.5);
};

export default function MemoryGame() {
  const [cards, setCards] = useState<string[]>(generateDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIME_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const { width, height } = useWindowSize();
  const gameOver = solved.length === cards.length;
  const timeUp = timeRemaining === 0 && !gameOver;

  const resetGame = useCallback(() => {
    setCards(generateDeck());
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setTimeRemaining(INITIAL_TIME_SECONDS);
    setTimerRunning(false);
    setGameStarted(false);
    toast.remove();
    toast("Game reset! Good luck!", {
      icon: "🎮",
      position: "bottom-right",
    });
  }, []);

  useEffect(() => {
    if (!timerRunning || timeUp || gameOver) return;
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timerRunning, timeUp, gameOver]);

  useEffect(() => {
    if (timeUp) {
      setTimerRunning(false);
      toast.error("Time's up! You lost.", {
        position: "bottom-right",
        duration: 5000,
        style: { fontWeight: "bold", fontSize: "1.2em" },
      });
    }
  }, [timeUp]);

  useEffect(() => {
    const checkForMatch = () => {
      const [first, second] = flipped;
      if (cards[first] === cards[second]) {
        setSolved((prevSolved) => [...prevSolved, ...flipped]);
        toast.success("Match found! Keep going!", { position: "bottom-right" });
      }
      setFlipped([]);
    };
    if (flipped.length === 2) {
      setTimeout(() => {
        checkForMatch();
      }, 1000);
    }
  }, [cards, flipped]);

  const handleClick = (index: number) => {
    if (gameOver || timeUp || (!timerRunning && gameStarted)) return;
    if (!gameStarted) {
      setGameStarted(true);
      setTimerRunning(true);
    }
    if (
      flipped.length === 1 &&
      !flipped.includes(index) &&
      !solved.includes(index)
    ) {
      setMoves((prevMoves) => prevMoves + 1);
    }
    if (
      !flipped.includes(index) &&
      flipped.length < 2 &&
      !solved.includes(index)
    ) {
      setFlipped([...flipped, index]);
    }
  };

  useEffect(() => {
    if (gameOver) {
      setTimerRunning(false);
      const timeRemainingFormatted = formatTime(timeRemaining);
      toast.success(
        `You WON in ${moves} moves with ${timeRemainingFormatted} left!`,
        {
          position: "bottom-right",
          duration: 8000,
          style: { fontWeight: "bold", fontSize: "1.2em" },
        }
      );
    }
  }, [gameOver, moves, timeRemaining]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const matchedPairs = solved.length / 2;
  const totalPairs = cards.length / 2;

  return (
    <div className="text-center w-full flex flex-col max-w-screen">
      {gameOver && (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
          <Confetti
            width={width}
            height={height}
            numberOfPieces={300}
            recycle={false}
          />
        </div>
      )}
      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-700 p-2">
        Memory Game
      </h1>
      <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-600">
        Match all the pairs within two minutes!
      </h3>
      <div className="bg-white p-6 md:p-8 mt-6 mb-8 w-full max-w-3xl rounded-3xl shadow-2xl justify-center mx-auto shadow-gray-200 border border-gray-100">
        <div className="grid grid-cols-3 divide-x divide-gray-300 text-center items-center">
          <div className="flex flex-col">
            <span className="text-gray-500 text-md font-semibold mb-1">
              Time Left
            </span>
            <span
              className={`text-3xl font-bold ${
                timeUp
                  ? "text-red-600"
                  : timeRemaining <= 30 && gameStarted
                  ? "text-orange-500"
                  : "text-red-500"
              }`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 text-md font-semibold mb-1">
              Moves
            </span>
            <span className="text-3xl font-bold text-blue-600">{moves}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 text-md font-semibold mb-1">
              Matched
            </span>
            <span className="text-3xl font-bold text-blue-600">
              {matchedPairs}/{totalPairs}
            </span>
          </div>
        </div>
      </div>
      {!gameStarted && (
        <p className="text-lg font-medium text-gray-600 -mt-2 mb-4">
          Click a card to begin the countdown!
        </p>
      )}
      {timeUp && (
        <h2 className="text-red-600 p-5 text-4xl font-bold">
          GAME OVER: Time ran out! 😔
        </h2>
      )}
      {gameOver && (
        <h2 className="text-green-500 p-5 text-4xl font-bold">
          YOU WON! 🎉 Congrats!
        </h2>
      )}
      <div className="grid grid-cols-4 gap-5 mt-5 justify-center mx-auto w-fit">
        {cards.map((card, index) => (
          <div
            className={`flex justify-center text-4xl font-bold text-black items-center w-50 h-50 transform cursor-pointer transition-transform duration-300 relative rounded-lg shadow-lg 
              ${
                flipped.includes(index) || solved.includes(index)
                  ? "rotate-180"
                  : ""
              } 
              ${
                gameOver || timeUp
                  ? "cursor-not-allowed opacity-80"
                  : "hover:shadow-xl"
              }`}
            key={index}
            onClick={() => handleClick(index)}
          >
            {flipped.includes(index) || solved.includes(index) ? (
              <Image
                className="rotate-180 object-cover"
                src={`/memory-cards/${card}.jpg`}
                fill
                alt="Memory Card"
                style={{ objectFit: "contain", padding: "5px" }}
              />
            ) : (
              <div className="absolute inset-0 flex justify-center items-center rounded-lg text-white text-3xl font-bold">
                <Image
                  src="/star.jpg"
                  fill
                  alt="Card Back"
                  className="object-cover rounded-lg brightness-45"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={resetGame}
        className="px-8 py-4 bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-xl mt-8 transition-all text-xl font-semibold shadow-2xl transform hover:scale-105 hover:shadow-indigo-500/50 max-w-md mx-auto"
      >
        Restart Game
      </button>
      <Toaster />
    </div>
  );
}
