"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HiddenDoor() {
  const router = useRouter();
  const [step, setStep] = useState<number>(0);
  const [showGesture, setShowGesture] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [showInput, setShowInput] = useState<boolean>(false);
  const [gestureSteps, setGestureSteps] = useState<string[]>([]);

  const secretSequence: string[] = [
    "top-left",
    "top-right",
    "bottom-right",
    "bottom-left",
  ];
  const correctPassword = process.env.HIDDEN_DOOR_CODE as string;

  // Step 1: Keyboard Shortcut (Activate Gesture Detection & Reset)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key === "H") {
        setStep(1);
        setShowGesture(true);
        setGestureSteps([]);
      }
      if (event.ctrlKey && event.altKey && event.key === "R") {
        setStep(0);
        setGestureSteps([]);
        setShowGesture(false);
        setShowInput(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Step 2: Click Gesture Sequence
  const handleClick = (stepName: string) => {
    if (step === 1) {
      setGestureSteps((prev) => {
        const newSteps = [...prev, stepName].slice(-secretSequence.length);
        return newSteps;
      });
    }
  };

  // Step 3: Listen for Gesture Completion
  useEffect(() => {
    if (
      gestureSteps.length === secretSequence.length &&
      JSON.stringify(gestureSteps) === JSON.stringify(secretSequence)
    ) {
      setStep(2);
      setShowGesture(false);
      setShowInput(true);
    }
  }, [gestureSteps]); // <- Watch for changes in gestureSteps

  // Step 4: Password Check
  const checkPassword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (password === correctPassword) {
        router.push("/sign-in");
        setShowInput(false);
      } else {
        console.log("❌ Incorrect password! Try again.");
      }
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center">
      {/* Invisible Buttons Positioned */}
      {showGesture && (
        <div>
          <button
            className="fixed -top-1 -left-1 w-4 h-4 z-100 border border-red-400 cursor-pointer"
            onClick={() => handleClick("top-left")}
          />
          <button
            className="fixed -top-1 -right-1 w-4 h-4 z-100 border border-blue-400 cursor-pointer"
            onClick={() => handleClick("top-right")}
          />
          <button
            className="fixed -bottom-1 -right-1 w-4 h-4 z-100 border border-green-400 cursor-pointer"
            onClick={() => handleClick("bottom-right")}
          />
          <button
            className="fixed -bottom-1 -left-1 w-4 h-4 z-100 border border-yellow-400 cursor-pointer"
            onClick={() => handleClick("bottom-left")}
          />
        </div>
      )}
      {showInput && (
        <input
          type="password"
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 px-2 py-1 border rounded z-100"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={checkPassword}
        />
      )}
    </div>
  );
}
