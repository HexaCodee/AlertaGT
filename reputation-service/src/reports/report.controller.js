import {
  registerReport,
  resolveReportRecord,
  fetchVerdict,
  fetchReportsByReporter,
  fetchReports,
} from './report.service.js';
import { REPORT_REASONS, REPORT_STATUS, ALERT_VERDICT } from '../../configs/reputation.rules.js';
import { getPostById, sendNotification } from '../shared/service-clients.js';

// POST /reports  → reportar una alerta (requiere sesión)
export const createReport = async (req, res, next) => {
  try {
    const reporterId = req.user.id;
    const { postId, reason, comment } = req.body;

    if (!postId || !reason) {
      return res.status(400).json({ success: false, message: 'postId y reason son obligatorios' });
    }
    if (!REPORT_REASONS.includes(reason)) {
      return res.status(400).json({ success: false, message: 'El motivo del reporte no es válido' });
    }

    // Obtener la alerta desde posts-service para conocer al autor.
    const post = await getPostById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Alerta no encontrada' });
    }

    const authorId = post.authorId;
    if (authorId === reporterId) {
      return res.status(400).json({ success: false, message: 'No puedes reportar tu propia alerta' });
    }

    const { report, verdict, penalized } = await registerReport({
      postId,
      authorId,
      reporterId,
      reason,
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Reporte registrado. Gracias por ayudar a mantener la comunidad segura.',
      data: {
        report,
        alertVerdict: verdict.verdict,
        falseReportsCount: verdict.falseReportsCount,
      },
    });

    // Efectos secundarios best-effort (no bloquean la respuesta).
    if (verdict.verdict === ALERT_VERDICT.CONFIRMED_FALSE && penalized) {
      void sendNotification({
        userId: authorId,
        postId,
        type: 'SYSTEM',
        title: 'Tu alerta fue marcada como falsa',
        body: 'Una de tus alertas fue reportada por la comunidad y marcada como falsa. Publicar información falsa afecta tu reputación.',
        data: { postId, reason: 'CONFIRMED_FALSE' },
      });
    }
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Ya reportaste esta alerta anteriormente' });
    }
    next(err);
  }
};

// GET /reports/alert/:postId  → veredicto agregado de una alerta (público)
export const getAlertVerdict = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const verdict = await fetchVerdict(postId);
    res.status(200).json({ success: true, data: verdict });
  } catch (err) {
    next(err);
  }
};

// GET /reports/mine  → reportes que ha emitido el usuario autenticado
export const getMyReports = async (req, res, next) => {
  try {
    const reports = await fetchReportsByReporter(req.user.id);
    res.status(200).json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
};

// GET /reports  → listado para moderación (admin/moderador)
export const listReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const { reports, pagination } = await fetchReports({ status, page, limit });
    res.status(200).json({ success: true, data: reports, pagination });
  } catch (err) {
    next(err);
  }
};

// PATCH /reports/:id/resolve  → resolver un reporte (admin/moderador)
export const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision } = req.body;

    if (![REPORT_STATUS.UPHELD, REPORT_STATUS.DISMISSED].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: `decision debe ser ${REPORT_STATUS.UPHELD} o ${REPORT_STATUS.DISMISSED}`,
      });
    }

    const report = await resolveReportRecord({ reportId: id, moderatorId: req.user.id, decision });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }

    res.status(200).json({ success: true, message: 'Reporte resuelto', data: report });
  } catch (err) {
    next(err);
  }
};
