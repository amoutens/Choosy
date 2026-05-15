import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../../../components/ui/Button'

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies gradient background by default', () => {
    render(<Button>Submit</Button>)
    expect(screen.getByRole('button').style.background).toMatch(/linear-gradient/)
  })

  it('applies ghost variant styles', () => {
    render(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button').style.background).toMatch(/rgba/)
  })

  it('applies danger variant color', () => {
    render(<Button variant="danger">Delete</Button>)
    const btn = screen.getByRole('button')
    expect(btn.style.color).toBeTruthy()
  })

  it('sets sm size height', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button').style.height).toBe('40px')
  })

  it('sets lg size height', () => {
    render(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button').style.height).toBe('56px')
  })

  it('adds w-full class when fullWidth is true', () => {
    render(<Button fullWidth>Full</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })

  it('is disabled when disabled prop is passed', () => {
    render(<Button disabled>Can't click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onClick when clicked', async () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire onClick when disabled', async () => {
    const onClick = jest.fn()
    render(
      <Button disabled onClick={onClick}>
        Click
      </Button>
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('forwards additional HTML attributes', () => {
    render(
      <Button type="submit" aria-label="save">
        Save
      </Button>
    )
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('type', 'submit')
    expect(btn).toHaveAttribute('aria-label', 'save')
  })
})
