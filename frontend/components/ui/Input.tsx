'use client';

import { forwardRef} from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, ...props }, ref) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (<label className="text-sm font-medium text-gray-700">{label}</label>)}
            <input
                ref={ref}
                className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400 ${error ? 'border-red-500' : 'border-gray-300'}`}
                {...props}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;