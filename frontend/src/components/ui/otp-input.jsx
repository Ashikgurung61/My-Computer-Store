import React, { useState, useRef } from 'react';

const OtpInput = ({ length = 6, onChange }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const { value } = e.target;
    if (isNaN(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Move to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="flex justify-center space-x-2">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={el => (inputRefs.current[index] = el)}
          type="text"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(e, index)}
          onKeyDown={e => handleKeyDown(e, index)}
          className="w-12 h-12 text-center text-lg font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      ))}
    </div>
  );
};

export default OtpInput;
