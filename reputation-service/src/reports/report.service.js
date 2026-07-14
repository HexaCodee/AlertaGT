import Report from './report.model.js';
import AlertVerdict from './alert-verdict.model.js';
import {
  RULES,
  ALERT_VERDICT,
  REPORT_STATUS,
} from '../../configs/reputation.rules.js';
import {
  applyPenalty,
  incrementReportsReceived,
} from '../reputation/reputation.service.js';

const FALSE_REASONS = new Set(['FALSE_INFO', 'RESOLVED']);

const getOrCreateVerdict = async (postId, authorId) => {
  let verdict = await AlertVerdict.findById(postId);
  if (!verdict) {
    verdict = await AlertVerdict.create({ _id: postId, postId, authorId });
  }
  return verdict;
};

/**
 * Aplica la penalización al autor si la alerta cruzó el umbral de reportes
 * falsos y aún no había sido penalizada. Idempotente gracias a penaltyApplied.
 */
const maybeConfirmFalse = async (verdict) => {
  if (verdict.penaltyApplied) return { penalized: false };

  if (verdict.falseReportsCount >= RULES.FALSE_REPORT_THRESHOLD) {
    verdict.verdict = ALERT_VERDICT.CONFIRMED_FALSE;
    verdict.penaltyApplied = true;
    verdict.resolvedAt = new Date();
    await verdict.save();

    await applyPenalty({
      userId: verdict.authorId,
      points: RULES.PENALTY_PER_FALSE_ALERT,
      reason: 'Alerta confirmada como falsa por la comunidad',
      refId: verdict.postId,
      type: 'FALSE_ALERT',
      markFalseAlert: true,
    });

    return { penalized: true };
  }
  return { penalized: false };
};

/**
 * Registra un reporte de una alerta y actualiza el veredicto agregado.
 * Devuelve el reporte, el veredicto actualizado y si el autor fue penalizado.
 */
export const registerReport = async ({ postId, authorId, reporterId, reason, comment }) => {
  // 1. Crear el reporte (índice único evita duplicados del mismo reporter)
  const report = await Report.create({ postId, authorId, reporterId, reason, comment });

  // 2. Actualizar el agregado de la alerta
  const verdict = await getOrCreateVerdict(postId, authorId);
  verdict.reportsCount += 1;
  if (FALSE_REASONS.has(reason)) verdict.falseReportsCount += 1;

  const current = verdict.reasonBreakdown.get(reason) || 0;
  verdict.reasonBreakdown.set(reason, current + 1);

  if (verdict.verdict === ALERT_VERDICT.ACTIVE) verdict.verdict = ALERT_VERDICT.FLAGGED;
  await verdict.save();

  // 3. Contador informativo en la reputación del autor
  await incrementReportsReceived(authorId);

  // 4. Confirmar como falsa + penalizar si cruzó el umbral
  const { penalized } = await maybeConfirmFalse(verdict);

  return { report, verdict, penalized };
};

/**
 * Resolución manual por moderador: UPHELD confirma la alerta como falsa (penaliza
 * si no se había hecho); DISMISSED la desestima.
 */
export const resolveReportRecord = async ({ reportId, moderatorId, decision }) => {
  const report = await Report.findById(reportId);
  if (!report) return null;

  report.status = decision;
  report.resolvedBy = moderatorId;
  report.resolvedAt = new Date();
  await report.save();

  if (decision === REPORT_STATUS.UPHELD) {
    const verdict = await getOrCreateVerdict(report.postId, report.authorId);
    if (!verdict.penaltyApplied) {
      verdict.verdict = ALERT_VERDICT.CONFIRMED_FALSE;
      verdict.penaltyApplied = true;
      verdict.resolvedAt = new Date();
      await verdict.save();

      await applyPenalty({
        userId: report.authorId,
        points: RULES.PENALTY_PER_FALSE_ALERT,
        reason: 'Alerta confirmada como falsa por un moderador',
        refId: report.postId,
        type: 'FALSE_ALERT',
        markFalseAlert: true,
      });
    }
  }

  return report;
};

// Veredicto agregado de una alerta.
export const fetchVerdict = async (postId) => {
  const verdict = await AlertVerdict.findById(postId);
  if (!verdict) {
    return {
      postId,
      reportsCount: 0,
      falseReportsCount: 0,
      verdict: ALERT_VERDICT.ACTIVE,
      reasonBreakdown: {},
    };
  }
  return {
    postId: verdict.postId,
    authorId: verdict.authorId,
    reportsCount: verdict.reportsCount,
    falseReportsCount: verdict.falseReportsCount,
    verdict: verdict.verdict,
    reasonBreakdown: Object.fromEntries(verdict.reasonBreakdown),
    resolvedAt: verdict.resolvedAt,
  };
};

// Reportes emitidos por un usuario.
export const fetchReportsByReporter = async (reporterId) => {
  return Report.find({ reporterId }).sort({ createdAt: -1 });
};

// Listado de reportes para el panel de moderación (paginado + filtros).
export const fetchReports = async ({ status, page = 1, limit = 20 }) => {
  const filter = {};
  if (status) filter.status = status;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const reports = await Report.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  const total = await Report.countDocuments(filter);

  return {
    reports,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalRecords: total,
      limit: limitNumber,
    },
  };
};
