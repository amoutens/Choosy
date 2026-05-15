import { FC, InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const FormField: FC<FormFieldProps> = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="font-[Poppins] text-[13px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
      {label}
    </label>
    <input
      className="font-[Poppins] text-[16px]"
      style={{
        width: '100%',
        height: '52px',
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '12px',
        padding: '0 16px',
        color: '#fff',
        outline: 'none',
      }}
      {...props}
    />
  </div>
)
