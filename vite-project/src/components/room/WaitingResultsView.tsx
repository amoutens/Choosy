import { FC } from 'react'
import { Spinner } from '../ui/Spinner'
import { RoomState } from '../../api/rooms'

interface Props {
  participants: RoomState['participants']
}

export const WaitingResultsView: FC<Props> = ({ participants }) => {
  const finishedCount = participants.filter((participant) => participant.hasFinished).length
  return (
    <div className="flex flex-col items-center gap-4">
      <Spinner />
      <p className="font-[Poppins] text-[15px] text-white">Waiting for everyone…</p>
      <p className="font-[Poppins] text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {finishedCount} / {participants.length} finished
      </p>
    </div>
  )
}
