import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormField } from '../../../components/ui/FormField'

describe('FormField', () => {
  it('renders the label text', () => {
    render(<FormField label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders an input element', () => {
    render(<FormField label="Email" type="email" />)
    expect(document.querySelector('input')).toBeInTheDocument()
  })

  it('passes type prop to the input', () => {
    render(<FormField label="Password" type="password" />)
    expect(document.querySelector('input')).toHaveAttribute('type', 'password')
  })

  it('renders placeholder text', () => {
    render(<FormField label="Email" placeholder="you@example.com" />)
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
  })

  it('marks input as required when required prop is set', () => {
    render(<FormField label="Email" required />)
    expect(document.querySelector('input')).toBeRequired()
  })

  it('calls onChange when user types', async () => {
    const onChange = jest.fn()
    render(<FormField label="Name" onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), 'hello')
    expect(onChange).toHaveBeenCalled()
  })

  it('shows the controlled value', () => {
    render(<FormField label="Name" value="Alice" onChange={jest.fn()} />)
    expect(screen.getByRole('textbox')).toHaveValue('Alice')
  })
})
