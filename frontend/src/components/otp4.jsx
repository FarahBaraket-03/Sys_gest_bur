import React, { useRef, useState, useEffect } from "react";
import { useAuthStore } from "../store/useauthStore";
import { toast } from 'react-toastify';

export default function Otp4({ onComplete }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);
  const { verify2FA, loading, error } = useAuthStore();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    
    try {
      await verify2FA(code);
      toast.success("Verification successful!");
      if (onComplete) onComplete();
    } catch (err) {
      // Error handled in store
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter" && index === 5) {
      handleSubmit();
      return;
    }

    if (!/^[0-9]{1}$/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "Tab" &&
      !e.metaKey
    ) {
      e.preventDefault();
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      if (index > 0 && !otp[index]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleInput = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto submit if last digit entered
    if (index === 5 && value) {
      handleSubmit();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain");
    const pasteNumbers = pasteData.replace(/\D/g, "");
    
    if (pasteNumbers.length === 6) {
      const digits = pasteNumbers.split("");
      setOtp(digits);
      inputRefs.current[5].focus();
    }
  };

  return (
    <section className="bg-white py-10 flex flex-col items-center">
      <h2 className="mb-6 text-center text-2xl font-semibold text-red-800">
        Enter Your Verification Code
      </h2>
      <div className="mb-6">
        <div className="flex gap-2 text-center text-gray-800">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              ref={(el) => (inputRefs.current[index] = el)}
              disabled={loading}
              className="flex w-12 h-12 items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-center text-2xl font-medium outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800"
            />
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-600">
          We've sent a 6-digit code to your email
        </p>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full py-2 px-4 bg-red-800 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </section>
  );
}