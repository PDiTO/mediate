import { useState, useEffect } from "react";

interface TypeWriterProps {
  sentences: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenSentences?: number;
}

export default function TypeWriter({
  sentences,
  typingSpeed = 50,
  deletingSpeed = 30,
  delayBetweenSentences = 2000,
}: TypeWriterProps) {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (sentences.length === 0) return;

    let timeout: NodeJS.Timeout;

    if (isWaiting) {
      timeout = setTimeout(() => {
        setIsWaiting(false);
        setIsDeleting(true);
      }, delayBetweenSentences);
      return () => clearTimeout(timeout);
    }

    const currentSentence = sentences[currentIndex];

    if (isDeleting) {
      if (currentText === "") {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % sentences.length);
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, deletingSpeed);
      }
    } else {
      if (currentText === currentSentence) {
        setIsWaiting(true);
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentSentence.slice(0, currentText.length + 1));
        }, typingSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [
    currentText,
    currentIndex,
    isDeleting,
    isWaiting,
    sentences,
    typingSpeed,
    deletingSpeed,
    delayBetweenSentences,
  ]);

  return (
    <div className="text-3xl text-white font-serif">
      {currentText}
      <span className="animate-pulse ml-[1px] opacity-80">❘</span>
    </div>
  );
}
