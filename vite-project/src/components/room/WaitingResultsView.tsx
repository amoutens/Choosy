import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner } from '../ui/Spinner'
import { RoomState } from '../../api/rooms'

interface Props {
  participants: RoomState['participants']
}

export const WaitingResultsView: FC<Props> = ({ participants }) => {
  const { t } = useTranslation()
  const finishedCount = participants.filter((participant) => participant.hasFinished).length
  return (
    <div className="flex flex-col items-center gap-4">
      <Spinner />
      <p className="font-poppins text-[15px] text-white">{t('waitingResults.waiting')}</p>
      <p className="font-poppins text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {t('waitingResults.finished', { count: finishedCount, total: participants.length })}
      </p>
    </div>
  )
}
