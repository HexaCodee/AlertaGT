import { useState } from 'react'
import { reportAlert, REPORT_REASONS } from '../services/reputationService.js'

/**
 * Modal para reportar una alerta con un motivo. Al enviar, llama al
 * reputation-service y notifica el resultado al padre vía onReported.
 */
export const ReportAlertModal = ({ postId, onClose, onReported }) => {
  const [reason, setReason] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) { setError('Selecciona un motivo'); return }
    setLoading(true)
    setError('')
    try {
      const res = await reportAlert(postId, reason, comment.trim())
      onReported?.(res?.data ?? null)
    } catch (err) {
      if (err.status === 409) setError('Ya habías reportado esta alerta.')
      else if (err.status === 400) setError(err.message || 'No puedes reportar esta alerta.')
      else setError(err.message || 'No se pudo enviar el reporte.')
      setLoading(false)
    }
  }

  return (
    <div className='rep-modal-overlay' onClick={onClose}>
      <div className='rep-modal' onClick={(e) => e.stopPropagation()} role='dialog' aria-modal='true'>
        <div className='rep-modal-head'>
          <h3>Reportar alerta</h3>
          <button className='rep-modal-close' onClick={onClose} aria-label='Cerrar'>
            <svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M18 6 6 18M6 6l12 12' />
            </svg>
          </button>
        </div>

        <p className='rep-modal-sub'>Ayúdanos a mantener la comunidad segura. ¿Cuál es el problema?</p>

        <form onSubmit={handleSubmit}>
          <div className='rep-reason-list'>
            {REPORT_REASONS.map((r) => (
              <label key={r.value} className={`rep-reason ${reason === r.value ? 'selected' : ''}`}>
                <input
                  type='radio'
                  name='reason'
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                />
                <span className='rep-reason-emoji'>{r.emoji}</span>
                <span className='rep-reason-label'>{r.label}</span>
              </label>
            ))}
          </div>

          <textarea
            className='rep-comment'
            placeholder='Comentario (opcional)'
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            rows={2}
          />

          {error && <p className='rep-modal-error'>{error}</p>}

          <div className='rep-modal-actions'>
            <button type='button' className='rep-btn-secondary' onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type='submit' className='rep-btn-primary' disabled={loading || !reason}>
              {loading ? 'Enviando...' : 'Enviar reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
