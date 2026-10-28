import React, { useState, useEffect } from 'react';
import { getFinancialInsightsApi } from '../services/api';
import { Sparkles, TrendingUp, ShieldCheck, AlertCircle, ArrowRight, MessageSquare, Compass } from 'lucide-react';

const AIAdvisorCard = ({ currency = '$', onOpenAdvisorChat }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await getFinancialInsightsApi();
        setInsights(res.data.data);
      } catch (err) {
        console.error('Failed to load AI insights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="card p-4 shadow-sm mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
          <span className="text-muted small">AI Financial Advisor is analyzing your cash flow...</span>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  const { score, grade, gradeColor, rule503020, forecast, recommendations } = insights;

  return (
    <div className="card shadow-sm border-0 mb-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.04) 0%, rgba(6, 182, 212, 0.04) 100%)' }}>
      <div className="card-body p-4">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary text-white p-3 rounded-4 shadow-sm d-flex align-items-center justify-content-center">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-bold mb-0">AI Financial Health Advisor</h5>
                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary small">
                  Smart Engine
                </span>
              </div>
              <small className="text-muted">Personalized cashflow diagnostic & 50/30/20 rule audit</small>
            </div>
          </div>

          <button
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
            onClick={onOpenAdvisorChat}
          >
            <MessageSquare size={16} />
            <span>Consult AI Advisor</span>
          </button>
        </div>

        {/* Diagnostic Grid */}
        <div className="row g-4 mb-4">
          {/* Health Score Gauge */}
          <div className="col-12 col-md-4">
            <div className="card p-3 h-100 bg-white shadow-sm border">
              <span className="text-muted small fw-bold text-uppercase">Financial Health Score</span>
              <div className="d-flex align-items-center gap-3 my-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3 text-white shadow-sm"
                  style={{ width: '64px', height: '64px', backgroundColor: gradeColor }}
                >
                  {score}
                </div>
                <div>
                  <div className="fw-bold fs-5 text-dark">{grade}</div>
                  <div className="text-muted small">Target score: 85+</div>
                </div>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${score}%`, backgroundColor: gradeColor }}
                ></div>
              </div>
            </div>
          </div>

          {/* 50/30/20 Rule Breakdown */}
          <div className="col-12 col-md-5">
            <div className="card p-3 h-100 bg-white shadow-sm border">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small fw-bold text-uppercase">50/30/20 Rule Audit</span>
                <span className="badge bg-light text-secondary border small">Recommended vs Actual</span>
              </div>

              {/* Needs */}
              <div className="mb-2">
                <div className="d-flex justify-content-between small">
                  <span>Needs (Essential): {currency}{rule503020.needs.actual.toLocaleString()}</span>
                  <span className={rule503020.needs.percentage > 50 ? 'text-warning fw-bold' : 'text-success fw-bold'}>
                    {rule503020.needs.percentage}% / 50%
                  </span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar bg-info"
                    style={{ width: `${Math.min(rule503020.needs.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Wants */}
              <div className="mb-2">
                <div className="d-flex justify-content-between small">
                  <span>Wants (Lifestyle): {currency}{rule503020.wants.actual.toLocaleString()}</span>
                  <span className={rule503020.wants.percentage > 30 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                    {rule503020.wants.percentage}% / 30%
                  </span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar bg-warning"
                    style={{ width: `${Math.min(rule503020.wants.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Savings */}
              <div>
                <div className="d-flex justify-content-between small">
                  <span>Savings: {currency}{rule503020.savings.actual.toLocaleString()}</span>
                  <span className={rule503020.savings.percentage < 20 ? 'text-warning fw-bold' : 'text-success fw-bold'}>
                    {rule503020.savings.percentage}% / 20%
                  </span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${Math.min(rule503020.savings.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Month-End Forecast */}
          <div className="col-12 col-md-3">
            <div className="card p-3 h-100 bg-white shadow-sm border">
              <span className="text-muted small fw-bold text-uppercase">Month-End Forecast</span>
              <div className="my-2">
                <div className="small text-muted">Daily Burn Rate</div>
                <div className="fs-5 fw-bold text-dark">{currency}{forecast.dailyBurnRate.toLocaleString()}/day</div>
              </div>
              <div className="pt-2 border-top">
                <div className="small text-muted">Projected Net Savings</div>
                <div className={`fs-6 fw-bold ${forecast.projectedNetSavings >= 0 ? 'text-success' : 'text-danger'}`}>
                  {forecast.projectedNetSavings >= 0 ? '+' : ''}
                  {currency}{forecast.projectedNetSavings.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Recommendation Pills */}
        {recommendations.length > 0 && (
          <div className="d-flex flex-column gap-2">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className={`p-3 rounded-3 small d-flex align-items-start gap-3 border ${
                  rec.type === 'alert' || rec.type === 'warning'
                    ? 'bg-warning bg-opacity-10 border-warning text-dark'
                    : rec.type === 'info'
                    ? 'bg-primary bg-opacity-10 border-primary text-dark'
                    : 'bg-success bg-opacity-10 border-success text-dark'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  <Compass size={18} className="text-primary" />
                </div>
                <div>
                  <strong className="d-block mb-1">{rec.title}</strong>
                  <span>{rec.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisorCard;
