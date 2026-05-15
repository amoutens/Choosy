import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '../../../components/ui/Modal'

describe('Modal', () => {
  it('renders children content', () => {
    render(
      <Modal onClose={jest.fn()}>
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = jest.fn()
    const { container } = render(
      <Modal onClose={onClose}>
        <p>Content</p>
      </Modal>
    )
    await userEvent.click(container.firstChild as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when inner content is clicked', async () => {
    const onClose = jest.fn()
    render(
      <Modal onClose={onClose}>
        <p>Inner content</p>
      </Modal>
    )
    await userEvent.click(screen.getByText('Inner content'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('is rendered with fixed positioning overlay', () => {
    const { container } = render(
      <Modal onClose={jest.fn()}>
        <span>x</span>
      </Modal>
    )
    const backdrop = container.firstChild as HTMLElement
    expect(backdrop).toHaveClass('fixed', 'inset-0', 'z-50')
  })
})
